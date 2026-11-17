package com.fitcoach.ai.service;

import com.fitcoach.ai.exception.AiGenerationFailedException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.json.JsonMapper;

/** Appel direct de l'API Messages d'Anthropic, sans dependance supplementaire. */
@Component
class AnthropicLanguageModel implements LanguageModel {

    private static final Logger log = LoggerFactory.getLogger(AnthropicLanguageModel.class);
    private static final int MAX_TOKENS = 16000;

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    AnthropicLanguageModel(
            @Value("${fitcoach.ai.api-key:}") String apiKey,
            @Value("${fitcoach.ai.model:claude-opus-5-5}") String model,
            @Value("${fitcoach.ai.base-url:https://api.anthropic.com}") String baseUrl,
            @Value("${fitcoach.ai.timeout-seconds:120}") long timeoutSeconds) {
        this.apiKey = apiKey == null ? "" : apiKey.strip();
        this.model = model;
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    @Override
    public boolean isConfigured() {
        return !apiKey.isEmpty();
    }

    @Override
    public String generateJson(String system, String user, String jsonSchema) {
        Map<String, Object> body = Map.of(
                "model", model,
                "max_tokens", MAX_TOKENS,
                "system", system,
                "messages", List.of(Map.of("role", "user", "content", user)),
                "output_config",
                        Map.of(
                                "effort", "low",
                                "format", Map.of("type", "json_schema", "schema", jsonMapper.readTree(jsonSchema))));
        Map<String, Object> response;
        try {
            response = restClient
                    .post()
                    .uri("/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (RestClientException e) {
            log.warn("Appel a l'API Anthropic en echec : {}", e.getMessage());
            throw new AiGenerationFailedException("Le service de generation IA est momentanement indisponible.");
        }
        return extractText(response);
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) {
            throw new AiGenerationFailedException("Reponse vide du service de generation IA.");
        }
        Object stopReason = response.get("stop_reason");
        if ("refusal".equals(stopReason)) {
            throw new AiGenerationFailedException("Le modele a decline cette demande. Reformulez vos contraintes.");
        }
        if ("max_tokens".equals(stopReason)) {
            throw new AiGenerationFailedException("La reponse du modele a ete tronquee. Reessayez.");
        }
        Object content = response.get("content");
        if (content instanceof List<?> blocks) {
            for (Object block : blocks) {
                if (block instanceof Map<?, ?> map && "text".equals(map.get("type")) && map.get("text") instanceof String text) {
                    return text;
                }
            }
        }
        throw new AiGenerationFailedException("Reponse du modele sans contenu exploitable.");
    }
}

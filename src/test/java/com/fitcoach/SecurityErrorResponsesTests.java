package com.fitcoach;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Reponses d'erreur vues par un vrai client HTTP : MockMvc ne rejoue ni le dispatch
 * vers /error ni l'ordre filtre de securite / validation du corps.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SecurityErrorResponsesTests {

    @TestConfiguration
    static class FailingEndpointConfig {
        @Bean
        FailingController failingController() {
            return new FailingController();
        }
    }

    @RestController
    static class FailingController {
        @GetMapping("/api/test-support/boom")
        String boom() {
            throw new IllegalStateException("panne simulee");
        }
    }

    @Value("${local.server.port}")
    private int port;

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void anUnexpectedServerErrorStaysA500WithAProblemDetailInsteadOfLoggingTheUserOut() throws Exception {
        String token = register("ATHLETE");

        HttpResponse<String> response = send("GET", "/api/test-support/boom", token, null);

        assertThat(response.statusCode()).isEqualTo(500);
        assertProblemDetail(response, 500);
        assertThat(response.headers().firstValue("WWW-Authenticate")).isEmpty();
    }

    @Test
    void anonymousRequestGets401WithABearerChallengeAndAProblemDetail() throws Exception {
        HttpResponse<String> response = send("GET", "/api/users/me", null, null);

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("WWW-Authenticate")).hasValueSatisfying(v -> assertThat(v).startsWith("Bearer"));
        assertProblemDetail(response, 401);
    }

    @Test
    void invalidTokenGets401WithABearerChallenge() throws Exception {
        HttpResponse<String> response = send("GET", "/api/users/me", "not-a-jwt", null);

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("WWW-Authenticate")).hasValueSatisfying(v -> assertThat(v).startsWith("Bearer"));
    }

    @Test
    void wrongPasswordIs401WithoutBearerChallengeSoTheClientDoesNotTreatItAsAnExpiredSession() throws Exception {
        String email = "athlete." + UUID.randomUUID() + "@fitcoach.dev";
        register("ATHLETE", email);

        HttpResponse<String> response =
                send("POST", "/api/auth/login", null, "{\"email\":\"" + email + "\",\"password\":\"Wrong1234\"}");

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("WWW-Authenticate")).isEmpty();
    }

    @Test
    void wrongRoleGets403WithAProblemDetail() throws Exception {
        String athleteToken = register("ATHLETE");

        HttpResponse<String> response = send("POST", "/api/coaching/posts", athleteToken, "{\"content\":\"x\"}");

        assertThat(response.statusCode()).isEqualTo(403);
        assertProblemDetail(response, 403);
    }

    @Test
    void roleIsCheckedBeforeTheBodyIsValidated() throws Exception {
        String athleteToken = register("ATHLETE");
        String coachToken = register("COACH");
        String randomId = UUID.randomUUID().toString();

        assertThat(send("POST", "/api/booking/slots", athleteToken, "{}").statusCode()).isEqualTo(403);
        assertThat(send("POST", "/api/coaching/posts", athleteToken, "{}").statusCode()).isEqualTo(403);
        assertThat(send("POST", "/api/catalog/exercises", athleteToken, "{}").statusCode()).isEqualTo(403);
        assertThat(send("PUT", "/api/catalog/exercises/" + randomId, athleteToken, "{}").statusCode()).isEqualTo(403);
        assertThat(send("POST", "/api/coaching/athletes", athleteToken, "{}").statusCode()).isEqualTo(403);
        assertThat(send("POST", "/api/coaching/athletes/" + randomId + "/notes", athleteToken, "{}").statusCode())
                .isEqualTo(403);
        assertThat(send("PUT", "/api/coaching/athletes/" + randomId + "/notes/" + randomId, athleteToken, "{}")
                        .statusCode())
                .isEqualTo(403);
        assertThat(send("POST", "/api/booking/bookings", coachToken, "{}").statusCode()).isEqualTo(403);
    }

    @Test
    void theRightRoleWithAnInvalidBodyStillGets400() throws Exception {
        String coachToken = register("COACH");

        assertThat(send("POST", "/api/booking/slots", coachToken, "{}").statusCode()).isEqualTo(400);
    }

    @Test
    void everyValidationMessageOfAFieldIsReturned() throws Exception {
        String body = "{\"firstName\":\"A\",\"lastName\":\"B\",\"email\":\"x." + UUID.randomUUID()
                + "@fitcoach.dev\",\"password\":\"abc\",\"role\":\"ATHLETE\"}";

        HttpResponse<String> response = send("POST", "/api/auth/register", null, body);

        assertThat(response.statusCode()).isEqualTo(400);
        String passwordErrors = objectMapper.readTree(response.body()).path("errors").path("password").asText();
        assertThat(passwordErrors).contains("8 caracteres minimum", "Au moins une majuscule", "Au moins un chiffre");
    }

    private void assertProblemDetail(HttpResponse<String> response, int status) throws Exception {
        assertThat(response.headers().firstValue("Content-Type")).hasValueSatisfying(v -> assertThat(v)
                .contains("application/problem+json"));
        JsonNode json = objectMapper.readTree(response.body());
        assertThat(json.path("status").asInt()).isEqualTo(status);
        assertThat(json.path("title").asText()).isNotBlank();
    }

    private String register(String role) throws Exception {
        return register(role, role.toLowerCase() + "." + UUID.randomUUID() + "@fitcoach.dev");
    }

    private String register(String role, String email) throws Exception {
        String body = "{\"firstName\":\"Test\",\"lastName\":\"Http\",\"email\":\"" + email
                + "\",\"password\":\"Password1\",\"role\":\"" + role + "\"}";
        HttpResponse<String> response = send("POST", "/api/auth/register", null, body);
        assertThat(response.statusCode()).isIn(200, 201);
        return objectMapper.readTree(response.body()).get("accessToken").asText();
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        HttpRequest.BodyPublisher publisher =
                body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body);
        builder.method(method, publisher);
        return http.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }
}

package com.fitcoach.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitcoach.catalog.api.CatalogExercise;
import com.fitcoach.catalog.api.ExerciseCatalog;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Sans cle ANTHROPIC_API_KEY (strategie auto), l'endpoint fonctionne avec le
 * generateur a regles sur le vrai catalogue seede par V5 ; l'API reelle n'est jamais appelee.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"fitcoach.ai.api-key=", "fitcoach.ai.strategy=auto"})
class ProgramGenerationEndpointTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ExerciseCatalog catalog;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode generate(String token, String level, int sessions, String equipment, Integer variant)
            throws Exception {
        String body = "{\"goal\":\"MUSCLE_GAIN\",\"level\":\"" + level + "\",\"sessionsPerWeek\":" + sessions
                + (equipment == null ? "" : ",\"equipment\":\"" + equipment + "\"")
                + (variant == null ? "" : ",\"variant\":" + variant) + "}";
        String response = mockMvc.perform(post("/api/ai/program-generation")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response);
    }

    private String athleteToken() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        return athlete.token();
    }

    @Test
    void withoutKeyTheRulesGeneratorAnswersFromTheRealCatalog() throws Exception {
        JsonNode draft = generate(athleteToken(), "INTERMEDIATE", 3, null, null);

        assertThat(draft.get("source").asText()).isEqualTo("RULES");
        assertThat(draft.get("description").asText()).contains("généré par règles");
        Set<UUID> catalogIds = catalog.listAll().stream().map(CatalogExercise::id).collect(Collectors.toSet());
        for (JsonNode day : draft.get("days")) {
            assertThat(day.get("label").asText()).startsWith("Jour ");
            assertThat(day.get("exercises").size()).isBetween(3, 6);
            Set<String> inDay = new HashSet<>();
            for (JsonNode item : day.get("exercises")) {
                assertThat(catalogIds).contains(UUID.fromString(item.get("exerciseId").asText()));
                assertThat(inDay.add(item.get("exerciseId").asText())).as("exercice en double dans un jour").isTrue();
                assertThat(item.get("sets").asInt()).isBetween(1, 20);
            }
        }
    }

    @Test
    void dayCountMatchesSessionsPerWeekForOneToSeven() throws Exception {
        String token = athleteToken();
        for (int sessions = 1; sessions <= 7; sessions++) {
            int days = generate(token, "ADVANCED", sessions, null, null).get("days").size();
            if (sessions == 7) {
                assertThat(days).as("7 seances : 6 jours + recuperation si possible").isIn(6, 7);
            } else {
                assertThat(days).as(sessions + " seance(s)").isEqualTo(sessions);
            }
        }
    }

    @Test
    void beginnerOnlyGetsBeginnerExercises() throws Exception {
        Map<UUID, String> difficulty =
                catalog.listAll().stream().collect(Collectors.toMap(CatalogExercise::id, CatalogExercise::difficulty));
        JsonNode draft = generate(athleteToken(), "BEGINNER", 5, null, null);

        assertThat(draft.get("level").asText()).isEqualTo("BEGINNER");
        for (JsonNode day : draft.get("days")) {
            for (JsonNode item : day.get("exercises")) {
                assertThat(difficulty.get(UUID.fromString(item.get("exerciseId").asText()))).isEqualTo("BEGINNER");
            }
        }
    }

    @Test
    void variantRotatesTheSelectionAndSameVariantIsDeterministic() throws Exception {
        String token = athleteToken();
        Function<JsonNode, String> days = draft -> draft.get("days").toString();

        JsonNode first = generate(token, "BEGINNER", 3, null, 0);
        JsonNode again = generate(token, "BEGINNER", 3, null, 0);
        JsonNode other = generate(token, "BEGINNER", 3, null, 1);

        assertThat(days.apply(again)).isEqualTo(days.apply(first));
        assertThat(days.apply(other)).isNotEqualTo(days.apply(first));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/ai/program-generation")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"goal\":\"MUSCLE_GAIN\",\"level\":\"BEGINNER\",\"sessionsPerWeek\":3}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsOutOfRangeSessionsPerWeekAndNegativeVariant() throws Exception {
        String token = athleteToken();

        mockMvc.perform(post("/api/ai/program-generation")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"goal\":\"MUSCLE_GAIN\",\"level\":\"BEGINNER\",\"sessionsPerWeek\":12}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/ai/program-generation")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"goal\":\"MUSCLE_GAIN\",\"level\":\"BEGINNER\",\"sessionsPerWeek\":3,\"variant\":-1}"))
                .andExpect(status().isBadRequest());
    }
}

package com.fitcoach.stats;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Couvre la regression de l'erreur d'arrondi de date corrigee cette session :
 * une seance du jour meme doit etre comptee dans le bucket "30 derniers
 * jours" de progressionScore, et le resume /overview doit refleter les
 * series enregistrees aujourd'hui.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StatsCorrectnessTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void todaysSessionIsCountedInProgressionScoreAndOverview() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered coach = TestUsers.register(mockMvc, objectMapper, "COACH");

        ObjectNode exerciseBody = objectMapper.createObjectNode();
        exerciseBody.put("name", "Exercice stats " + System.nanoTime());
        exerciseBody.put("description", "d");
        exerciseBody.put("equipment", "aucun");
        exerciseBody.put("difficulty", "BEGINNER");
        exerciseBody.put("defaultRestSeconds", 60);
        exerciseBody.putArray("muscles");
        exerciseBody.putArray("tagIds");
        exerciseBody.putArray("alternativeExerciseIds");

        String exerciseResponse = mockMvc.perform(post("/api/catalog/exercises")
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exerciseBody)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String exerciseId = objectMapper.readTree(exerciseResponse).get("id").asText();

        ObjectNode sessionBody = objectMapper.createObjectNode();
        sessionBody.put("title", "Seance du jour");
        sessionBody.put("performedAt", Instant.now().toString());
        String sessionResponse = mockMvc.perform(post("/api/training/sessions")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionBody)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String sessionId = objectMapper.readTree(sessionResponse).get("id").asText();

        ObjectNode setBody = objectMapper.createObjectNode();
        setBody.put("exerciseId", exerciseId);
        setBody.put("setNumber", 1);
        setBody.put("reps", 10);
        setBody.put("weightKg", "50");
        mockMvc.perform(post("/api/training/sessions/" + sessionId + "/sets")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(setBody)))
                .andExpect(status().isOk());

        // 50kg * 10 reps = 500 de volume, doit apparaitre dans le bucket des 30 derniers jours.
        mockMvc.perform(get("/api/stats/progression-score").header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.last30DaysVolume").value(500.0));

        String overviewResponse = mockMvc.perform(get("/api/stats/overview")
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode overview = objectMapper.readTree(overviewResponse);
        org.assertj.core.api.Assertions.assertThat(overview.get("sessionsThisWeek").asInt()).isGreaterThanOrEqualTo(1);
    }
}

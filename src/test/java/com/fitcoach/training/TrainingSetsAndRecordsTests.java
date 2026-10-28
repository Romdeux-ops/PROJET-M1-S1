package com.fitcoach.training;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Couvre deux corrections de cette session : la collision de position apres
 * suppression d'une serie, et le recalcul des records personnels.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingSetsAndRecordsTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Registered athlete;
    private String exerciseId;

    private void setUp() throws Exception {
        athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered coach = TestUsers.register(mockMvc, objectMapper, "COACH");

        ObjectNode exerciseBody = objectMapper.createObjectNode();
        exerciseBody.put("name", "Exercice test " + System.nanoTime());
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
        exerciseId = objectMapper.readTree(exerciseResponse).get("id").asText();
    }

    private String createSession() throws Exception {
        ObjectNode sessionBody = objectMapper.createObjectNode();
        sessionBody.put("title", "Seance test");
        sessionBody.put("performedAt", Instant.now().toString());

        String response = mockMvc.perform(post("/api/training/sessions")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionBody)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private JsonNode addSet(String sessionId, int setNumber, String weightKg) throws Exception {
        ObjectNode setBody = objectMapper.createObjectNode();
        setBody.put("exerciseId", exerciseId);
        setBody.put("setNumber", setNumber);
        setBody.put("reps", 5);
        setBody.put("weightKg", weightKg);

        String response = mockMvc.perform(post("/api/training/sessions/" + sessionId + "/sets")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(setBody)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response);
    }

    @Test
    void noPositionCollisionAfterDeletingAndReaddingASet() throws Exception {
        setUp();
        String sessionId = createSession();

        JsonNode afterFirst = addSet(sessionId, 1, "50");
        JsonNode afterSecond = addSet(sessionId, 2, "55");
        JsonNode afterThird = addSet(sessionId, 3, "60");

        List<Integer> positionsSoFar = new ArrayList<>();
        afterThird.get("sets").forEach(s -> positionsSoFar.add(s.get("position").asInt()));
        assertThat(positionsSoFar).containsExactlyInAnyOrder(0, 1, 2);

        String firstSetId = afterFirst.get("sets").get(0).get("id").asText();
        mockMvc.perform(delete("/api/training/sessions/" + sessionId + "/sets/" + firstSetId)
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isOk());

        JsonNode afterFourth = addSet(sessionId, 4, "65");
        List<Integer> finalPositions = new ArrayList<>();
        afterFourth.get("sets").forEach(s -> finalPositions.add(s.get("position").asInt()));
        // Pas de doublon de position malgre la suppression intermediaire.
        assertThat(finalPositions).doesNotHaveDuplicates();
        assertThat(finalPositions).contains(3);
    }

    @Test
    void personalRecordIsRecalculatedAfterDeletingTheBestSet() throws Exception {
        setUp();
        String sessionId = createSession();

        addSet(sessionId, 1, "80"); // record initial
        JsonNode afterBest = addSet(sessionId, 2, "100"); // nouveau record

        mockMvc.perform(get("/api/training/personal-records")
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isOk());

        String bestSetId = null;
        for (JsonNode set : afterBest.get("sets")) {
            if (set.get("weightKg").asText().startsWith("100")) {
                bestSetId = set.get("id").asText();
            }
        }
        assertThat(bestSetId).isNotNull();

        mockMvc.perform(delete("/api/training/sessions/" + sessionId + "/sets/" + bestSetId)
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isOk());

        String recordsResponse = mockMvc.perform(get("/api/training/personal-records")
                        .header("Authorization", "Bearer " + athlete.token()))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode records = objectMapper.readTree(recordsResponse);

        boolean foundRecalculatedRecord = false;
        for (JsonNode record : records) {
            if (record.get("exerciseId").asText().equals(exerciseId) && record.get("metric").asText().equals("MAX_WEIGHT")) {
                // Le record doit retomber sur la meilleure serie restante (80), pas rester a 100.
                assertThat(record.get("value").asDouble()).isEqualTo(80.0);
                foundRecalculatedRecord = true;
            }
        }
        assertThat(foundRecalculatedRecord).isTrue();
    }
}

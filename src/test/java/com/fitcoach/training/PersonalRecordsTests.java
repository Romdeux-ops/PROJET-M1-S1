package com.fitcoach.training;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Les records restent la projection exacte des series existantes, date comprise. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PersonalRecordsTests {

    private static final Instant MONDAY = Instant.parse("2025-03-03T08:00:00Z");
    private static final Instant WEDNESDAY = Instant.parse("2025-03-05T08:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered athlete;
    private String exerciseId;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        athlete = client.register("ATHLETE");
        exerciseId = client.createExercise(client.register("COACH"));
    }

    @Test
    void deletingTheBestSessionFallsBackToTheNextBestThenRemovesTheRecord() throws Exception {
        String mondaySession = client.createSession(athlete, MONDAY, 60);
        client.addSet(athlete, mondaySession, exerciseId, 5, "80");
        String wednesdaySession = client.createSession(athlete, WEDNESDAY, 60);
        client.addSet(athlete, wednesdaySession, exerciseId, 5, "100");

        assertThat(record("MAX_WEIGHT").orElseThrow().get("value").decimalValue()).isEqualByComparingTo("100");

        client.delete(athlete, "/api/training/sessions/" + wednesdaySession).andExpect(status().isNoContent());
        JsonNode fallback = record("MAX_WEIGHT").orElseThrow();
        assertThat(fallback.get("value").decimalValue()).isEqualByComparingTo("80");
        assertThat(Instant.parse(fallback.get("achievedAt").asText())).isEqualTo(MONDAY);

        client.delete(athlete, "/api/training/sessions/" + mondaySession).andExpect(status().isNoContent());
        assertThat(record("MAX_WEIGHT")).isEmpty();
        assertThat(record("ESTIMATED_1RM")).isEmpty();
    }

    @Test
    void estimatedOneRepMaxUsesEpleyAndAchievedAtFollowsTheSessionDate() throws Exception {
        String sessionId = client.createSession(athlete, MONDAY, 60);
        client.addSet(athlete, sessionId, exerciseId, 10, "60");

        // 60 * (1 + 10/30) = 80
        assertThat(record("ESTIMATED_1RM").orElseThrow().get("value").decimalValue()).isEqualByComparingTo("80");

        Map<String, Object> moved = Map.of("title", "Deplacee", "performedAt", WEDNESDAY.toString());
        client.put(athlete, "/api/training/sessions/" + sessionId, moved).andExpect(status().isOk());

        assertThat(Instant.parse(record("ESTIMATED_1RM").orElseThrow().get("achievedAt").asText()))
                .isEqualTo(WEDNESDAY);
    }

    @Test
    void onlyTheEstimatedOneRepMaxRecordSetIsFlagged() throws Exception {
        String sessionId = client.createSession(athlete, MONDAY, 60);
        client.addSet(athlete, sessionId, exerciseId, 5, "80");
        JsonNode session = client.addSet(athlete, sessionId, exerciseId, 5, "90");

        JsonNode sets = session.get("sets");
        assertThat(sets.get(0).get("isPersonalRecord").asBoolean()).isFalse();
        assertThat(sets.get(1).get("isPersonalRecord").asBoolean()).isTrue();
    }

    private Optional<JsonNode> record(String metric) throws Exception {
        JsonNode records = client.json(client.get(athlete, "/api/training/personal-records").andExpect(status().isOk()));
        for (JsonNode record : records) {
            if (record.get("exerciseId").asText().equals(exerciseId) && record.get("metric").asText().equals(metric)) {
                return Optional.of(record);
            }
        }
        return Optional.empty();
    }
}

package com.fitcoach.training;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Bornes et precision des series, et refus des seances datees dans le futur. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TrainingInputValidationTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered athlete;
    private String exerciseId;
    private String sessionId;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        athlete = client.register("ATHLETE");
        exerciseId = client.createExercise(client.register("COACH"));
        sessionId = client.createSession(athlete, Instant.now().minus(1, ChronoUnit.HOURS), 45);
    }

    @Test
    void weightAboveColumnCapacityIsRejectedWith400() throws Exception {
        addSet(Map.of("reps", 5, "weightKg", 10000)).andExpect(status().isBadRequest());
    }

    @Test
    void weightWithMoreThanTwoDecimalsIsRejected() throws Exception {
        addSet(Map.of("reps", 5, "weightKg", 60.125)).andExpect(status().isBadRequest());
    }

    @Test
    void rpeWithMoreThanOneDecimalIsRejected() throws Exception {
        addSet(Map.of("reps", 5, "weightKg", 60, "rpe", 7.25)).andExpect(status().isBadRequest());
    }

    @Test
    void acceptedValuesAreReturnedExactlyAsStored() throws Exception {
        addSet(Map.of("reps", 5, "weightKg", 60.13, "rpe", 7.5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sets[0].weightKg").value(60.13))
                .andExpect(jsonPath("$.sets[0].rpe").value(7.5));
        client.get(athlete, "/api/training/sessions/" + sessionId)
                .andExpect(jsonPath("$.sets[0].weightKg").value(60.13))
                .andExpect(jsonPath("$.sets[0].rpe").value(7.5));
    }

    @Test
    void decimalRepsAreRejectedInsteadOfTruncated() throws Exception {
        addSet(Map.of("reps", 5.5, "weightKg", 60)).andExpect(status().isBadRequest());
    }

    @Test
    void sessionInTheFutureIsRejected() throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Demain",
                "performedAt", Instant.now().plus(1, ChronoUnit.DAYS).toString(),
                "durationMinutes", 30);
        client.post(athlete, "/api/training/sessions", body).andExpect(status().isBadRequest());
    }

    @Test
    void sessionWithinClockToleranceIsAccepted() throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Horloge en avance",
                "performedAt", Instant.now().plus(2, ChronoUnit.MINUTES).toString(),
                "durationMinutes", 30);
        client.post(athlete, "/api/training/sessions", body).andExpect(status().isCreated());
    }

    @Test
    void movingAnExistingSessionToTheFutureIsRejected() throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Deplacee",
                "performedAt", Instant.now().plus(3, ChronoUnit.DAYS).toString(),
                "durationMinutes", 30);
        client.put(athlete, "/api/training/sessions/" + sessionId, body).andExpect(status().isBadRequest());
    }

    private ResultActions addSet(Map<String, Object> fields) throws Exception {
        Map<String, Object> body = new HashMap<>(fields);
        body.put("exerciseId", exerciseId);
        body.put("setNumber", 1);
        return client.post(athlete, "/api/training/sessions/" + sessionId + "/sets", body);
    }
}

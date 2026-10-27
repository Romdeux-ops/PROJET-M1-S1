package com.fitcoach.planning;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Cycle de statuts du planning : PLANNED -> (PENDING_VALIDATION|DONE) -> DONE, protege a chaque etape. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlanningTransitionsTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String scheduleSession(Registered athlete) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("title", "Seance planifiee " + System.nanoTime());
        body.put("scheduledDate", LocalDate.now().toString());

        String response = mockMvc.perform(post("/api/planning/scheduled")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private void attachCoach(Registered coach, Registered athlete) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("athleteEmail", athlete.email());
        mockMvc.perform(post("/api/coaching/athletes")
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());
    }

    private String createWorkoutSession(Registered athlete) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("title", "Seance realisee " + System.nanoTime());
        body.put("performedAt", Instant.now().toString());
        String response = mockMvc.perform(post("/api/training/sessions")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asText();
    }

    private void completeSession(Registered athlete, String scheduledSessionId) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("workoutSessionId", createWorkoutSession(athlete));
        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/complete")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    void athleteWithNoCoachCompletesDirectlyToDone() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        String scheduledSessionId = scheduleSession(athlete);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("workoutSessionId", createWorkoutSession(athlete));

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/complete")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void athleteWithActiveCoachGoesToPendingValidationThenCoachValidates() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered coach = TestUsers.register(mockMvc, objectMapper, "COACH");
        attachCoach(coach, athlete);

        String scheduledSessionId = scheduleSession(athlete);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("workoutSessionId", createWorkoutSession(athlete));

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/complete")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_VALIDATION"));

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/validate")
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }

    @Test
    void validatingASessionNotPendingIsRejected() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered coach = TestUsers.register(mockMvc, objectMapper, "COACH");
        attachCoach(coach, athlete);

        String scheduledSessionId = scheduleSession(athlete);
        // Encore PLANNED : jamais complete.

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/validate")
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token()))
                .andExpect(status().isConflict());
    }

    @Test
    void coachWithNoRelationshipCannotValidate() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered realCoach = TestUsers.register(mockMvc, objectMapper, "COACH");
        Registered strangerCoach = TestUsers.register(mockMvc, objectMapper, "COACH");
        attachCoach(realCoach, athlete);

        String scheduledSessionId = scheduleSession(athlete);
        completeSession(athlete, scheduledSessionId);

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/validate")
                        .with(csrf())
                        .header("Authorization", "Bearer " + strangerCoach.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void workoutSessionNotBelongingToAthleteIsRejectedOnComplete() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered otherAthlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");

        ObjectNode sessionBody = objectMapper.createObjectNode();
        sessionBody.put("title", "Seance d'un autre");
        sessionBody.put("performedAt", Instant.now().toString());
        String otherSessionResponse = mockMvc.perform(post("/api/training/sessions")
                        .with(csrf())
                        .header("Authorization", "Bearer " + otherAthlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionBody)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String otherWorkoutSessionId =
                objectMapper.readTree(otherSessionResponse).get("id").asText();

        String scheduledSessionId = scheduleSession(athlete);

        ObjectNode completeBody = objectMapper.createObjectNode();
        completeBody.put("workoutSessionId", otherWorkoutSessionId);

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/complete")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeBody)))
                .andExpect(status().isNotFound());
    }
}

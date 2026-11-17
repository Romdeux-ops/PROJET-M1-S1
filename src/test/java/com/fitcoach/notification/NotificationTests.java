package com.fitcoach.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fitcoach.notification.service.SessionReminderService;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Centre de notifications : rappels idempotents, evenements du planning, lecture et isolation entre utilisateurs. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionReminderService reminderService;

    @Autowired
    private Clock clock;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String schedule(Registered athlete, LocalDate date) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("title", "Jambes " + System.nanoTime());
        body.put("scheduledDate", date.toString());
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

    private JsonNode notificationsOf(Registered user) throws Exception {
        String response = mockMvc.perform(get("/api/notifications").header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("content");
    }

    private long unreadCount(Registered user) throws Exception {
        String response = mockMvc.perform(
                        get("/api/notifications/unread-count").header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("count").asLong();
    }

    private void attachCoach(Registered coach, Registered athlete) throws Exception {
        new ApiClient(mockMvc).attachCoach(coach, athlete);
    }

    private void completeScheduled(Registered athlete, String scheduledSessionId) throws Exception {
        ObjectNode workout = objectMapper.createObjectNode();
        workout.put("title", "Seance realisee");
        workout.put("performedAt", Instant.now().toString());
        String workoutResponse = mockMvc.perform(post("/api/training/sessions")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workout)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        ObjectNode body = objectMapper.createObjectNode();
        body.put("workoutSessionId", objectMapper.readTree(workoutResponse).get("id").asText());
        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/complete")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    void reminderIsCreatedOnceForASessionPlannedToday() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        schedule(athlete, LocalDate.now(clock));

        reminderService.sendReminders();
        int secondRun = reminderService.sendReminders();

        assertThat(secondRun).isZero();
        assertThat(unreadCount(athlete)).isEqualTo(1);
        JsonNode notifications = notificationsOf(athlete);
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0).get("type").asText()).isEqualTo("SESSION_REMINDER");
        assertThat(notifications.get(0).get("title").asText()).contains("aujourd'hui");
        assertThat(notifications.get(0).get("link").asText()).isEqualTo("/planning");
    }

    @Test
    void sessionsTomorrowAreRemindedButFartherOnesAreNot() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        schedule(athlete, LocalDate.now(clock).plusDays(1));
        schedule(athlete, LocalDate.now(clock).plusDays(3));

        reminderService.sendReminders();

        JsonNode notifications = notificationsOf(athlete);
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0).get("title").asText()).contains("demain");
    }

    @Test
    void completedOrSkippedSessionsAreNotReminded() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        String id = schedule(athlete, LocalDate.now(clock));
        mockMvc.perform(patch("/api/planning/scheduled/" + id + "/skip")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isOk());

        reminderService.sendReminders();

        assertThat(unreadCount(athlete)).isZero();
    }

    @Test
    void completionNotifiesTheCoachAndValidationNotifiesTheAthlete() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered coach = TestUsers.register(mockMvc, objectMapper, "COACH");
        attachCoach(coach, athlete);
        String scheduledSessionId = schedule(athlete, LocalDate.now(clock).plusDays(5));

        completeScheduled(athlete, scheduledSessionId);

        JsonNode forCoach = notificationsOf(coach);
        assertThat(forCoach).hasSize(1);
        assertThat(forCoach.get(0).get("type").asText()).isEqualTo("SESSION_PENDING_VALIDATION");
        assertThat(forCoach.get(0).get("title").asText()).isEqualTo("Séance à valider");
        assertThat(notificationsOf(athlete)).isEmpty();

        mockMvc.perform(patch("/api/planning/scheduled/" + scheduledSessionId + "/validate")
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token()))
                .andExpect(status().isOk());

        JsonNode forAthlete = notificationsOf(athlete);
        assertThat(forAthlete).hasSize(1);
        assertThat(forAthlete.get(0).get("type").asText()).isEqualTo("SESSION_VALIDATED");
    }

    @Test
    void athleteWithoutCoachCompletingDoesNotNotifyAnyone() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        String scheduledSessionId = schedule(athlete, LocalDate.now(clock).plusDays(5));

        completeScheduled(athlete, scheduledSessionId);

        assertThat(notificationsOf(athlete)).isEmpty();
    }

    @Test
    void markReadAndMarkAllReadUpdateTheUnreadCount() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        schedule(athlete, LocalDate.now(clock));
        schedule(athlete, LocalDate.now(clock).plusDays(1));
        reminderService.sendReminders();
        assertThat(unreadCount(athlete)).isEqualTo(2);

        String firstId = notificationsOf(athlete).get(0).get("id").asText();
        mockMvc.perform(patch("/api/notifications/" + firstId + "/read")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isNoContent());
        assertThat(unreadCount(athlete)).isEqualTo(1);

        mockMvc.perform(patch("/api/notifications/read-all")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token()))
                .andExpect(status().isNoContent());
        assertThat(unreadCount(athlete)).isZero();
        mockMvc.perform(get("/api/notifications").header("Authorization", "Bearer " + athlete.token()))
                .andExpect(jsonPath("$.content[0].readAt").isNotEmpty());
    }

    @Test
    void anotherUsersNotificationIsNotFound() throws Exception {
        Registered owner = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered stranger = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        schedule(owner, LocalDate.now(clock));
        reminderService.sendReminders();
        String id = notificationsOf(owner).get(0).get("id").asText();

        mockMvc.perform(patch("/api/notifications/" + id + "/read")
                        .with(csrf())
                        .header("Authorization", "Bearer " + stranger.token()))
                .andExpect(status().isNotFound());
        assertThat(notificationsOf(stranger)).isEmpty();
        assertThat(unreadCount(owner)).isEqualTo(1);
    }

    @Test
    void notificationsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/notifications/unread-count")).andExpect(status().isUnauthorized());
    }
}

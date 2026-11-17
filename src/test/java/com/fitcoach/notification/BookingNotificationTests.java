package com.fitcoach.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.notification.service.BookingReminderService;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Notifications des reservations de creneaux : creation, annulation et rappels (athlete et coach). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingNotificationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingReminderService reminderService;

    @Autowired
    private Clock clock;

    private ApiClient api;
    private Registered coach;
    private Registered athlete;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiClient(mockMvc);
        coach = api.register("COACH");
        athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
    }

    private Instant inDays(int days) {
        return Instant.now().truncatedTo(ChronoUnit.MINUTES).plus(Duration.ofDays(days));
    }

    /** Demain midi au fuseau metier : toujours dans le futur, et dans la fenetre de rappel. */
    private Instant tomorrowNoon() {
        return LocalDate.now(clock).plusDays(1).atTime(12, 0).atZone(clock.getZone()).toInstant();
    }

    private String book(Registered user, Instant start) throws Exception {
        String slotId = api.createSlot(coach, start, start.plus(Duration.ofHours(1)));
        return api.json(api.post(user, "/api/booking/bookings", Map.of("slotId", slotId))
                        .andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    private JsonNode notificationsOf(Registered user) throws Exception {
        return api.json(api.get(user, "/api/notifications").andExpect(status().isOk()))
                .get("content");
    }

    @Test
    void bookingNotifiesTheCoachButNotTheAthleteWhoBooked() throws Exception {
        book(athlete, inDays(3));

        JsonNode forCoach = notificationsOf(coach);
        assertThat(forCoach).hasSize(1);
        assertThat(forCoach.get(0).get("type").asText()).isEqualTo("BOOKING_CREATED");
        assertThat(forCoach.get(0).get("title").asText()).isEqualTo("Nouvelle réservation");
        assertThat(forCoach.get(0).get("body").asText()).contains("Test ATHLETE").contains(" à ");
        assertThat(forCoach.get(0).get("link").asText()).isEqualTo("/booking");
        assertThat(notificationsOf(athlete)).isEmpty();
    }

    @Test
    void cancellationByTheAthleteNotifiesTheCoach() throws Exception {
        String bookingId = book(athlete, inDays(3));

        api.patch(athlete, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isOk());

        JsonNode forCoach = notificationsOf(coach);
        assertThat(forCoach).hasSize(2);
        assertThat(forCoach.get(0).get("type").asText()).isEqualTo("BOOKING_CANCELLED");
        assertThat(forCoach.get(0).get("title").asText()).isEqualTo("Réservation annulée");
        assertThat(forCoach.get(0).get("body").asText()).contains("Test ATHLETE");
        assertThat(notificationsOf(athlete)).isEmpty();
    }

    @Test
    void cancellationByTheCoachNotifiesTheAthleteInstead() throws Exception {
        String bookingId = book(athlete, inDays(3));

        api.patch(coach, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isOk());

        JsonNode forAthlete = notificationsOf(athlete);
        assertThat(forAthlete).hasSize(1);
        assertThat(forAthlete.get(0).get("type").asText()).isEqualTo("BOOKING_CANCELLED");
        // Le coach n'a que la notification de la creation, pas de sa propre annulation.
        assertThat(notificationsOf(coach)).hasSize(1);
    }

    @Test
    void reminderIsCreatedOnceForTheAthleteAndOnceForTheCoach() throws Exception {
        book(athlete, tomorrowNoon());

        reminderService.sendReminders();
        int secondRun = reminderService.sendReminders();

        assertThat(secondRun).isZero();
        for (Registered user : new Registered[] {athlete, coach}) {
            long reminders = 0;
            for (JsonNode n : notificationsOf(user)) {
                if (n.get("type").asText().equals("BOOKING_REMINDER")) {
                    reminders++;
                    assertThat(n.get("title").asText()).isEqualTo("Rendez-vous demain");
                    assertThat(n.get("body").asText()).contains("demain à 12:00");
                }
            }
            assertThat(reminders).isEqualTo(1);
        }
        assertThat(api.json(api.get(athlete, "/api/notifications/unread-count")).get("count").asLong())
                .isEqualTo(1);
    }

    @Test
    void remindersNameTheCounterpartAndSkipBookingsBeyondTomorrow() throws Exception {
        book(athlete, inDays(4));
        Registered otherAthlete = api.register("ATHLETE");
        api.attachCoach(coach, otherAthlete);
        book(otherAthlete, tomorrowNoon());

        reminderService.sendReminders();

        for (JsonNode n : notificationsOf(athlete)) {
            assertThat(n.get("type").asText()).isNotEqualTo("BOOKING_REMINDER");
        }
        JsonNode reminderForOther = notificationsOf(otherAthlete).get(0);
        assertThat(reminderForOther.get("type").asText()).isEqualTo("BOOKING_REMINDER");
        assertThat(reminderForOther.get("body").asText()).contains("Test COACH");
    }
}

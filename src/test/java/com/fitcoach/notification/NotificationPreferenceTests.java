package com.fitcoach.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.notification.service.BookingReminderService;
import com.fitcoach.notification.service.SessionReminderService;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * La preference « notifications desactivees » coupe les rappels (seance, rendez-vous) mais garde
 * les evenements transactionnels (reservation creee ou annulee, seance a valider ou validee).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationPreferenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionReminderService sessionReminders;

    @Autowired
    private BookingReminderService bookingReminders;

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

    private void disableNotifications(Registered user) throws Exception {
        api.patch(user, "/api/users/me/profile", Map.of("notificationsEnabled", false))
                .andExpect(status().isOk());
    }

    private List<String> typesOf(Registered user) throws Exception {
        List<String> types = new ArrayList<>();
        for (JsonNode n : api.json(api.get(user, "/api/notifications").andExpect(status().isOk())).get("content")) {
            types.add(n.get("type").asText());
        }
        return types;
    }

    private void book(Instant start) throws Exception {
        String slotId = api.createSlot(coach, start, start.plus(Duration.ofHours(1)));
        api.post(athlete, "/api/booking/bookings", Map.of("slotId", slotId)).andExpect(status().isCreated());
    }

    @Test
    void disabledAccountGetsNoSessionReminder() throws Exception {
        disableNotifications(athlete);
        api.schedule(athlete, LocalDate.now(clock));

        sessionReminders.sendReminders();

        assertThat(typesOf(athlete)).doesNotContain("SESSION_REMINDER");
    }

    @Test
    void enabledAccountStillGetsItsSessionReminder() throws Exception {
        api.schedule(athlete, LocalDate.now(clock));

        sessionReminders.sendReminders();

        assertThat(typesOf(athlete)).contains("SESSION_REMINDER");
    }

    @Test
    void disabledAccountStillGetsTransactionalEventsButNoBookingReminder() throws Exception {
        disableNotifications(coach);
        Instant tomorrowNoon = LocalDate.now(clock).plusDays(1).atTime(12, 0).atZone(clock.getZone()).toInstant();
        book(tomorrowNoon);

        bookingReminders.sendReminders();

        assertThat(typesOf(coach)).contains("BOOKING_CREATED").doesNotContain("BOOKING_REMINDER");
        assertThat(typesOf(athlete)).contains("BOOKING_REMINDER");
    }
}

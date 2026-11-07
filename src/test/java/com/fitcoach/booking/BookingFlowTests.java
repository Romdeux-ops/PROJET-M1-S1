package com.fitcoach.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Publication de creneaux, reservation, annulation et refus des doubles reservations. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingFlowTests {

    private static final ZoneId ZONE = ZoneId.of("Europe/Paris");

    @Autowired
    private MockMvc mockMvc;

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

    private static Instant inDays(int days) {
        return Instant.now().truncatedTo(ChronoUnit.MINUTES).plus(Duration.ofDays(days));
    }

    private static Instant inHours(int hours) {
        return Instant.now().truncatedTo(ChronoUnit.MINUTES).plus(Duration.ofHours(hours));
    }

    private static String rangeQuery() {
        LocalDate today = LocalDate.now(ZONE);
        return "?from=" + today.minusDays(1) + "&to=" + today.plusDays(30);
    }

    private JsonNode book(Registered user, String slotId) throws Exception {
        return api.json(api.post(user, "/api/booking/bookings", Map.of("slotId", slotId))
                .andExpect(status().isCreated()));
    }

    @Test
    void athleteBooksAFreeSlotWhichThenAppearsBookedToTheCoach() throws Exception {
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));

        api.get(athlete, "/api/booking/slots/available" + rangeQuery())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(slotId))
                .andExpect(jsonPath("$[0].coachName").value("Test COACH"));

        JsonNode booking = book(athlete, slotId);
        assertThat(booking.get("status").asText()).isEqualTo("CONFIRMED");
        assertThat(booking.get("coachId").asText()).isEqualTo(coach.id().toString());

        api.get(athlete, "/api/booking/slots/available" + rangeQuery())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        api.get(coach, "/api/booking/slots" + rangeQuery())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookingId").value(booking.get("id").asText()))
                .andExpect(jsonPath("$[0].athleteId").value(athlete.id().toString()));
        api.get(coach, "/api/booking/bookings" + rangeQuery())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void athleteWhoIsNotAClientCannotSeeNorBookTheSlots() throws Exception {
        Registered stranger = api.register("ATHLETE");
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));

        api.get(stranger, "/api/booking/slots/available" + rangeQuery())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        api.post(stranger, "/api/booking/bookings", Map.of("slotId", slotId)).andExpect(status().isForbidden());
    }

    @Test
    void onlyCoachesPublishSlots() throws Exception {
        Map<String, Object> body = Map.of(
                "startsAt", inDays(3).toString(), "endsAt", inDays(3).plus(Duration.ofHours(1)).toString());
        api.post(athlete, "/api/booking/slots", body).andExpect(status().isForbidden());
    }

    @Test
    void invalidSlotsAreRejected() throws Exception {
        Instant start = inDays(3);
        api.post(coach, "/api/booking/slots", Map.of("startsAt", start.toString(), "endsAt", start.toString()))
                .andExpect(status().isBadRequest());
        api.post(coach, "/api/booking/slots", Map.of(
                        "startsAt", start.toString(), "endsAt", start.plus(Duration.ofHours(5)).toString()))
                .andExpect(status().isBadRequest());
        api.post(coach, "/api/booking/slots", Map.of(
                        "startsAt", inDays(-1).toString(), "endsAt", inDays(-1).plus(Duration.ofHours(1)).toString()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void aCoachCannotPublishOverlappingSlots() throws Exception {
        Instant start = inDays(3);
        api.createSlot(coach, start, start.plus(Duration.ofHours(1)));

        api.post(coach, "/api/booking/slots", Map.of(
                        "startsAt", start.plus(Duration.ofMinutes(30)).toString(),
                        "endsAt", start.plus(Duration.ofMinutes(90)).toString()))
                .andExpect(status().isConflict());
        // Bout a bout : les plages sont semi-ouvertes, aucun chevauchement.
        api.createSlot(coach, start.plus(Duration.ofHours(1)), start.plus(Duration.ofHours(2)));
    }

    @Test
    void aSlotCannotBeBookedTwice() throws Exception {
        Registered otherAthlete = api.register("ATHLETE");
        api.attachCoach(coach, otherAthlete);
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));

        book(athlete, slotId);
        api.post(otherAthlete, "/api/booking/bookings", Map.of("slotId", slotId))
                .andExpect(status().isConflict());
    }

    @Test
    void concurrentBookingsOfTheSameSlotLetExactlyOneThrough() throws Exception {
        Registered otherAthlete = api.register("ATHLETE");
        api.attachCoach(coach, otherAthlete);
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));

        CountDownLatch start = new CountDownLatch(1);
        Callable<Integer> attempt1 = () -> {
            start.await();
            return api.post(athlete, "/api/booking/bookings", Map.of("slotId", slotId))
                    .andReturn().getResponse().getStatus();
        };
        Callable<Integer> attempt2 = () -> {
            start.await();
            return api.post(otherAthlete, "/api/booking/bookings", Map.of("slotId", slotId))
                    .andReturn().getResponse().getStatus();
        };

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Future<Integer>> results = List.of(executor.submit(attempt1), executor.submit(attempt2));
            start.countDown();
            List<Integer> statuses = List.of(results.get(0).get(), results.get(1).get());
            assertThat(statuses).containsExactlyInAnyOrder(201, 409);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void anAthleteCannotHoldTwoOverlappingBookingsWithDifferentCoaches() throws Exception {
        Registered otherCoach = api.register("COACH");
        api.attachCoach(otherCoach, athlete);
        Instant start = inDays(3);
        String slotId = api.createSlot(coach, start, start.plus(Duration.ofHours(1)));
        String overlappingSlotId = api.createSlot(
                otherCoach, start.plus(Duration.ofMinutes(30)), start.plus(Duration.ofMinutes(90)));

        book(athlete, slotId);
        api.post(athlete, "/api/booking/bookings", Map.of("slotId", overlappingSlotId))
                .andExpect(status().isConflict());
    }

    @Test
    void cancellingFreesTheSlotForAnotherBooking() throws Exception {
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));
        String bookingId = book(athlete, slotId).get("id").asText();

        api.patch(athlete, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelledBy").value(athlete.id().toString()));
        api.patch(athlete, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isConflict());

        book(athlete, slotId);
    }

    @Test
    void theCoachCanCancelToo() throws Exception {
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));
        String bookingId = book(athlete, slotId).get("id").asText();

        api.patch(coach, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cancelledBy").value(coach.id().toString()));
    }

    @Test
    void cancellationIsRefusedLessThan24HoursBeforeTheStart() throws Exception {
        String slotId = api.createSlot(coach, inHours(2), inHours(3));
        String bookingId = book(athlete, slotId).get("id").asText();

        api.patch(athlete, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isBadRequest());
    }

    @Test
    void someoneOutsideTheBookingCannotCancelIt() throws Exception {
        Registered stranger = api.register("COACH");
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));
        String bookingId = book(athlete, slotId).get("id").asText();

        api.patch(stranger, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isNotFound());
    }

    @Test
    void aBookedSlotCannotBeDeletedUntilTheBookingIsCancelled() throws Exception {
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));
        String bookingId = book(athlete, slotId).get("id").asText();

        api.delete(coach, "/api/booking/slots/" + slotId).andExpect(status().isConflict());

        api.patch(athlete, "/api/booking/bookings/" + bookingId + "/cancel", Map.of())
                .andExpect(status().isOk());
        api.delete(coach, "/api/booking/slots/" + slotId).andExpect(status().isNoContent());
    }

    @Test
    void anotherCoachCannotDeleteTheSlot() throws Exception {
        Registered otherCoach = api.register("COACH");
        String slotId = api.createSlot(coach, inDays(3), inDays(3).plus(Duration.ofHours(1)));

        api.delete(otherCoach, "/api/booking/slots/" + slotId).andExpect(status().isNotFound());
    }
}

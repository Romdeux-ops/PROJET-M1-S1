package com.fitcoach.booking;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Les garanties anti double-booking tiennent en base, sans passer par le
 * service : c'est ce qui les rend sures sous acces concurrent.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingConstraintsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private Registered coach;
    private Registered athlete;
    private Instant start;

    @BeforeEach
    void setUp() throws Exception {
        ApiClient api = new ApiClient(mockMvc);
        coach = api.register("COACH");
        athlete = api.register("ATHLETE");
        start = Instant.now().truncatedTo(ChronoUnit.MINUTES).plus(Duration.ofDays(5));
    }

    private UUID insertSlot(UUID coachId, Instant startsAt, Instant endsAt) {
        return jdbc.queryForObject(
                "INSERT INTO availability_slots (coach_id, starts_at, ends_at) VALUES (?, ?, ?) RETURNING id",
                UUID.class, coachId, Timestamp.from(startsAt), Timestamp.from(endsAt));
    }

    private void insertBooking(UUID slotId, UUID coachId, UUID athleteId, Instant startsAt, Instant endsAt) {
        jdbc.update(
                "INSERT INTO bookings (slot_id, coach_id, athlete_id, starts_at, ends_at) VALUES (?, ?, ?, ?, ?)",
                slotId, coachId, athleteId, Timestamp.from(startsAt), Timestamp.from(endsAt));
    }

    @Test
    void overlappingSlotsOfOneCoachAreRejected() {
        insertSlot(coach.id(), start, start.plus(Duration.ofHours(1)));

        assertThatThrownBy(() -> insertSlot(
                        coach.id(), start.plus(Duration.ofMinutes(59)), start.plus(Duration.ofHours(2))))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void aSlotHoldsAtMostOneConfirmedBooking() throws Exception {
        Registered otherAthlete = new ApiClient(mockMvc).register("ATHLETE");
        Instant end = start.plus(Duration.ofHours(1));
        UUID slotId = insertSlot(coach.id(), start, end);
        insertBooking(slotId, coach.id(), athlete.id(), start, end);

        assertThatThrownBy(() -> insertBooking(slotId, coach.id(), otherAthlete.id(), start, end))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void anAthleteHoldsNoOverlappingConfirmedBookings() throws Exception {
        Registered otherCoach = new ApiClient(mockMvc).register("COACH");
        Instant end = start.plus(Duration.ofHours(1));
        UUID slotId = insertSlot(coach.id(), start, end);
        Instant otherStart = start.plus(Duration.ofMinutes(30));
        Instant otherEnd = otherStart.plus(Duration.ofHours(1));
        UUID otherSlotId = insertSlot(otherCoach.id(), otherStart, otherEnd);
        insertBooking(slotId, coach.id(), athlete.id(), start, end);

        assertThatThrownBy(() -> insertBooking(otherSlotId, otherCoach.id(), athlete.id(), otherStart, otherEnd))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void aSlotWithAConfirmedBookingCannotBeDeleted() {
        Instant end = start.plus(Duration.ofHours(1));
        UUID slotId = insertSlot(coach.id(), start, end);
        insertBooking(slotId, coach.id(), athlete.id(), start, end);

        assertThatThrownBy(() -> jdbc.update("DELETE FROM availability_slots WHERE id = ?", slotId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}

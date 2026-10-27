package com.fitcoach.stats;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.FixedClockConfig;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * "Maintenant" est le lundi 13 janvier 2025 a 00h30 a Paris, soit encore
 * dimanche en UTC : les jours et semaines doivent etre ceux de Paris.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(FixedClockConfig.class)
class StatsTimeZoneTests {

    private static final LocalDate MONDAY = LocalDate.of(2025, 1, 13);
    /** Lundi 00h15 a Paris. */
    private static final Instant MONDAY_NIGHT = Instant.parse("2025-01-12T23:15:00Z");
    /** Dimanche 23h00 a Paris. */
    private static final Instant SUNDAY_NIGHT = Instant.parse("2025-01-12T22:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered athlete;
    private Registered coach;
    private String mondaySession;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        athlete = client.register("ATHLETE");
        coach = client.register("COACH");
        String exerciseId = client.createExercise(coach);

        mondaySession = client.createSession(athlete, MONDAY_NIGHT, 30);
        client.addSet(athlete, mondaySession, exerciseId, 10, "50");
        String sundaySession = client.createSession(athlete, SUNDAY_NIGHT, 45);
        client.addSet(athlete, sundaySession, exerciseId, 10, "40");
    }

    @Test
    void overviewSplitsDaysAndWeeksInTheBusinessTimeZone() throws Exception {
        JsonNode overview = client.json(client.get(athlete, "/api/stats/overview").andExpect(status().isOk()));

        assertThat(overview.get("sessionsThisWeek").asInt()).isEqualTo(1);
        assertThat(overview.get("minutesThisWeek").asInt()).isEqualTo(30);
        assertThat(overview.get("currentStreakDays").asInt()).isEqualTo(2);
        JsonNode activity = overview.get("weeklyActivity");
        assertThat(activity).hasSize(7);
        assertThat(activity.get(6).get("date").asText()).isEqualTo("2025-01-13");
        assertThat(activity.get(6).get("minutes").asInt()).isEqualTo(30);
        assertThat(activity.get(5).get("minutes").asInt()).isEqualTo(45);
    }

    @Test
    void weeklyVolumeUsesLocalWeeks() throws Exception {
        JsonNode weeks = client.json(client.get(athlete, "/api/stats/volume/weekly?weeks=4").andExpect(status().isOk()));

        assertThat(weeks).hasSize(2);
        assertThat(weeks.get(0).get("weekStart").asText()).isEqualTo("2025-01-06");
        assertThat(weeks.get(0).get("totalVolume").decimalValue()).isEqualByComparingTo("400");
        assertThat(weeks.get(1).get("weekStart").asText()).isEqualTo("2025-01-13");
        assertThat(weeks.get(1).get("totalVolume").decimalValue()).isEqualByComparingTo("500");
    }

    @Test
    void adherenceCountsSessionsAwaitingCoachValidation() throws Exception {
        client.attachCoach(coach, athlete);
        String completed = client.schedule(athlete, MONDAY);
        client.patch(athlete, "/api/planning/scheduled/" + completed + "/complete", Map.of("workoutSessionId", mondaySession))
                .andExpect(status().isOk());
        String skipped = client.schedule(athlete, MONDAY);
        client.patch(athlete, "/api/planning/scheduled/" + skipped + "/skip", Map.of()).andExpect(status().isOk());

        JsonNode weeks = client.json(client.get(athlete, "/api/stats/adherence/weekly?weeks=1").andExpect(status().isOk()));

        assertThat(weeks).hasSize(1);
        JsonNode week = weeks.get(0);
        assertThat(week.get("weekStart").asText()).isEqualTo("2025-01-13");
        assertThat(week.get("planned").asInt()).isEqualTo(2);
        assertThat(week.get("pending").asInt()).isEqualTo(1);
        assertThat(week.get("skipped").asInt()).isEqualTo(1);
        assertThat(week.get("done").asInt()).isZero();
    }
}

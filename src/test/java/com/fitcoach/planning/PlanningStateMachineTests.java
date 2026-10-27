package com.fitcoach.planning;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Transitions interdites (409) et replanification, en complement de {@link PlanningTransitionsTests}. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlanningStateMachineTests {

    private static final LocalDate DAY = LocalDate.of(2025, 3, 3);

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered athlete;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        athlete = client.register("ATHLETE");
    }

    @Test
    void aDoneSessionCanNeitherBeSkippedNorRescheduled() throws Exception {
        String id = client.schedule(athlete, DAY);
        String workoutId = client.createSession(athlete, Instant.parse("2025-03-03T08:00:00Z"), 45);
        client.patch(athlete, path(id, "complete"), Map.of("workoutSessionId", workoutId))
                .andExpect(jsonPath("$.status").value("DONE"));

        client.patch(athlete, path(id, "skip"), Map.of()).andExpect(status().isConflict());
        client.patch(athlete, path(id, "reschedule"), Map.of("scheduledDate", DAY.plusDays(1).toString()))
                .andExpect(status().isConflict());
        client.patch(athlete, path(id, "complete"), Map.of("workoutSessionId", workoutId))
                .andExpect(status().isConflict());
    }

    @Test
    void reschedulingASkippedSessionPlansItAgain() throws Exception {
        String id = client.schedule(athlete, DAY);
        client.patch(athlete, path(id, "skip"), Map.of()).andExpect(jsonPath("$.status").value("SKIPPED"));
        client.patch(athlete, path(id, "skip"), Map.of()).andExpect(status().isConflict());

        client.patch(athlete, path(id, "reschedule"), Map.of("scheduledDate", DAY.plusDays(2).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PLANNED"))
                .andExpect(jsonPath("$.scheduledDate").value(DAY.plusDays(2).toString()));
    }

    @Test
    void calendarRangeMustBeOrderedAndAtMostOneYear() throws Exception {
        client.get(athlete, "/api/planning/scheduled?from=2025-01-01&to=2025-12-31").andExpect(status().isOk());
        client.get(athlete, "/api/planning/scheduled?from=2025-01-01&to=2026-01-02").andExpect(status().isBadRequest());
        client.get(athlete, "/api/planning/scheduled?from=2025-02-01&to=2025-01-01").andExpect(status().isBadRequest());
    }

    private static String path(String scheduledSessionId, String action) {
        return "/api/planning/scheduled/" + scheduledSessionId + "/" + action;
    }
}

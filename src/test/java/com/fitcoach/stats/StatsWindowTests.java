package com.fitcoach.stats;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.FixedClockConfig;
import com.fitcoach.support.TestUsers.Registered;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/**
 * Une fenetre de N jours couvre exactement N jours, aujourd'hui inclus, et la
 * serie en cours ignore les jours posterieurs a aujourd'hui.
 *
 * <p>"Aujourd'hui" est le lundi 13 janvier 2025 a Paris (voir {@link FixedClockConfig}).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(FixedClockConfig.class)
class StatsWindowTests {

    /** Lundi 13 janvier, 00h15 a Paris. */
    private static final Instant TODAY = Instant.parse("2025-01-12T23:15:00Z");
    /** Dimanche 12 janvier, 23h00 a Paris. */
    private static final Instant YESTERDAY = Instant.parse("2025-01-12T22:00:00Z");
    /** 15 decembre 2024 : today - 29 jours, premier jour de la fenetre de 30 jours. */
    private static final Instant DAY_MINUS_29 = Instant.parse("2024-12-15T12:00:00Z");
    /** 14 decembre 2024 : today - 30 jours, hors de la fenetre de 30 jours. */
    private static final Instant DAY_MINUS_30 = Instant.parse("2024-12-14T12:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    private ApiClient client;
    private Registered athlete;
    private String exerciseId;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        athlete = client.register("ATHLETE");
        exerciseId = client.json(client.perform(
                        athlete,
                        MockMvcRequestBuilders.get("/api/catalog/exercises").param("query", "Developpe couche")))
                .get("content")
                .get(0)
                .get("id")
                .asText();
    }

    @Test
    void progressionScoreWindowIsExactlyThirtyDays() throws Exception {
        client.addSet(athlete, client.createSession(athlete, DAY_MINUS_30, 30), exerciseId, 1, "100");
        client.addSet(athlete, client.createSession(athlete, DAY_MINUS_29, 30), exerciseId, 1, "40");

        JsonNode score = client.json(
                client.get(athlete, "/api/stats/progression-score").andExpect(status().isOk()));

        assertThat(score.get("last30DaysVolume").decimalValue()).isEqualByComparingTo("40");
        assertThat(score.get("previous30DaysVolume").decimalValue()).isEqualByComparingTo("100");
    }

    @Test
    void muscleDistributionOfOneDayCoversOnlyToday() throws Exception {
        client.addSet(athlete, client.createSession(athlete, TODAY, 30), exerciseId, 1, "100");
        client.addSet(athlete, client.createSession(athlete, YESTERDAY, 30), exerciseId, 1, "50");

        BigDecimal oneDay = totalVolume(1);
        BigDecimal twoDays = totalVolume(2);

        assertThat(oneDay.signum()).isPositive();
        assertThat(twoDays).isEqualByComparingTo(oneDay.multiply(new BigDecimal("1.5")));
    }

    @Test
    void streakIgnoresSessionsDatedAfterToday() throws Exception {
        client.createSession(athlete, TODAY, 30);
        client.createSession(athlete, YESTERDAY, 30);
        // L'API refuse desormais une seance future : on simule une donnee anterieure au correctif.
        jdbcClient.sql("INSERT INTO workout_sessions (athlete_id, title, performed_at) VALUES (:id, 'Futur', :at)")
                .param("id", athlete.id())
                .param("at", java.sql.Timestamp.from(Instant.parse("2025-01-20T10:00:00Z")))
                .update();

        JsonNode streak = client.json(client.get(athlete, "/api/stats/streak").andExpect(status().isOk()));

        assertThat(streak.get("currentStreakDays").asInt()).isEqualTo(2);
    }

    private BigDecimal totalVolume(int days) throws Exception {
        JsonNode shares = client.json(
                client.get(athlete, "/api/stats/muscle-distribution?days=" + days).andExpect(status().isOk()));
        BigDecimal total = BigDecimal.ZERO;
        for (JsonNode share : shares) {
            total = total.add(share.get("volume").decimalValue());
        }
        return total;
    }
}

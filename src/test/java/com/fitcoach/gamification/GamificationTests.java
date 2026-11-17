package com.fitcoach.gamification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GamificationTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered athlete;
    private Registered coach;
    private String exerciseId;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        athlete = client.register("ATHLETE");
        coach = client.register("COACH");
        exerciseId = client.createExercise(coach);
    }

    @Test
    void aNewAthleteHasNoXpAndNoBadge() throws Exception {
        JsonNode me = client.json(client.get(athlete, "/api/gamification/me").andExpect(status().isOk()));

        assertThat(me.get("xp").asLong()).isZero();
        assertThat(me.get("level").asInt()).isEqualTo(1);
        assertThat(earnedCodes(me)).isEmpty();
        assertThat(me.get("badges")).hasSize(8);
    }

    @Test
    void firstSessionAwardsTheBadgeAndExperience() throws Exception {
        String sessionId = client.createSession(athlete, Instant.now().minus(1, ChronoUnit.HOURS), 40);
        client.addSet(athlete, sessionId, exerciseId, 5, "100");

        JsonNode me = client.json(client.get(athlete, "/api/gamification/me").andExpect(status().isOk()));

        // 1 seance (10) + 1 serie (2) + 1 exercice avec record (25).
        assertThat(me.get("xp").asLong()).isEqualTo(37);
        assertThat(me.get("level").asInt()).isEqualTo(1);
        assertThat(earnedCodes(me)).containsExactlyInAnyOrder("FIRST_SESSION", "FIRST_PR");
    }

    @Test
    void sevenConsecutiveDaysAwardTheStreakBadge() throws Exception {
        Instant today = Instant.now().truncatedTo(ChronoUnit.HOURS);
        for (int daysAgo = 0; daysAgo < 7; daysAgo++) {
            client.createSession(athlete, today.minus(daysAgo, ChronoUnit.DAYS).minus(2, ChronoUnit.HOURS), 30);
        }

        JsonNode me = client.json(client.get(athlete, "/api/gamification/me").andExpect(status().isOk()));

        assertThat(earnedCodes(me)).contains("FIRST_SESSION", "STREAK_7").doesNotContain("STREAK_30", "SESSIONS_10");
    }

    @Test
    void anAwardedBadgeIsNotAwardedTwice() throws Exception {
        client.createSession(athlete, Instant.now().minus(1, ChronoUnit.HOURS), 40);

        JsonNode first = client.json(client.get(athlete, "/api/gamification/me").andExpect(status().isOk()));
        JsonNode second = client.json(client.get(athlete, "/api/gamification/me").andExpect(status().isOk()));

        assertThat(awardedAt(second, "FIRST_SESSION")).isEqualTo(awardedAt(first, "FIRST_SESSION"));
    }

    @Test
    void theCatalogListsEveryBadgeInOrder() throws Exception {
        JsonNode badges = client.json(client.get(athlete, "/api/gamification/badges").andExpect(status().isOk()));

        assertThat(badges).hasSize(8);
        assertThat(badges.get(0).get("code").asText()).isEqualTo("FIRST_SESSION");
        assertThat(badges.get(0).get("awardedAt").isNull()).isTrue();
    }

    @Test
    void theLeaderboardRanksAthletesByExperienceAndAlwaysShowsTheViewer() throws Exception {
        Registered rival = client.register("ATHLETE");
        client.createSession(rival, Instant.now().minus(2, ChronoUnit.HOURS), 30);
        String sessionId = client.createSession(athlete, Instant.now().minus(1, ChronoUnit.HOURS), 30);
        client.addSet(athlete, sessionId, exerciseId, 5, "100");

        JsonNode mine = ownEntry(athlete);
        JsonNode theirs = ownEntry(rival);

        assertThat(mine.get("xp").asLong()).isEqualTo(37);
        assertThat(theirs.get("xp").asLong()).isEqualTo(10);
        assertThat(mine.get("rank").asInt()).isLessThan(theirs.get("rank").asInt());
    }

    @Test
    void endpointsRequireAuthentication() throws Exception {
        client.get(null, "/api/gamification/me").andExpect(status().isUnauthorized());
        client.get(null, "/api/gamification/leaderboard").andExpect(status().isUnauthorized());
    }

    private JsonNode ownEntry(Registered viewer) throws Exception {
        JsonNode board = client.json(client.get(viewer, "/api/gamification/leaderboard").andExpect(status().isOk()));
        for (JsonNode entry : board) {
            if (entry.get("you").asBoolean()) {
                return entry;
            }
        }
        throw new AssertionError("l'utilisateur est absent de son propre classement");
    }

    private static List<String> earnedCodes(JsonNode me) {
        List<String> codes = new ArrayList<>();
        me.get("badges").forEach(badge -> {
            if (!badge.get("awardedAt").isNull()) {
                codes.add(badge.get("code").asText());
            }
        });
        return codes;
    }

    private static String awardedAt(JsonNode me, String code) {
        for (JsonNode badge : me.get("badges")) {
            if (badge.get("code").asText().equals(code)) {
                return badge.get("awardedAt").asText();
            }
        }
        throw new AssertionError("badge absent : " + code);
    }
}

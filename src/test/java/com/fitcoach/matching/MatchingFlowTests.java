package com.fitcoach.matching;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Inscription FitMatch, fil, swipes, matchs, messagerie debloquee et concurrence. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MatchingFlowTests {

    private static final String PROFILE = "/api/matching/profile";
    private static final String FEED = "/api/matching/feed?limit=50";
    private static final String SWIPES = "/api/matching/swipes";
    private static final String MATCHES = "/api/matching/matches";
    private static final String CONVERSATIONS = "/api/messaging/conversations";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private ApiClient api;

    @BeforeEach
    void setUp() {
        api = new ApiClient(mockMvc);
    }

    // ------------------------------------------------------------- helpers

    private static Map<String, Object> athleteProfile() {
        Map<String, Object> body = new HashMap<>();
        body.put("headline", "Je veux reprendre la muscu serieusement");
        body.put("sports", List.of("STRENGTH", "RUNNING"));
        body.put("availability", List.of("EVENING", "WEEKEND"));
        body.put("trainingMode", "ONSITE");
        body.put("city", "Paris");
        body.put("maxBudgetEur", 50);
        body.put("birthDate", LocalDate.now().minusYears(24).toString());
        return body;
    }

    private static Map<String, Object> coachProfile() {
        Map<String, Object> body = new HashMap<>();
        body.put("headline", "Coach force et remise en forme");
        body.put("sports", List.of("STRENGTH", "RUNNING", "HIIT"));
        body.put("goals", List.of("GENERAL_FITNESS", "MUSCLE_GAIN"));
        body.put("levels", List.of("BEGINNER", "INTERMEDIATE"));
        body.put("availability", List.of("EVENING", "WEEKEND"));
        body.put("trainingMode", "BOTH");
        body.put("city", " paris ");
        body.put("sessionRateEur", 40);
        body.put("birthDate", LocalDate.now().minusYears(31).toString());
        return body;
    }

    private Registered member(String role, Map<String, Object> profile) throws Exception {
        Registered user = api.register(role);
        api.put(user, PROFILE, profile).andExpect(status().isOk());
        return user;
    }

    private JsonNode swipe(Registered from, Registered to, String decision) throws Exception {
        return api.json(api.post(from, SWIPES, Map.of("targetId", to.id().toString(), "decision", decision))
                .andExpect(status().isOk()));
    }

    private JsonNode cardOf(JsonNode feed, Registered user) {
        for (JsonNode card : feed) {
            if (card.get("userId").asText().equals(user.id().toString())) {
                return card;
            }
        }
        return null;
    }

    // --------------------------------------------------------------- profil

    @Test
    void theFormIsPrefilledFromTheAccountAndListsWhatIsMissing() throws Exception {
        Registered athlete = api.register("ATHLETE");
        Registered coach = api.register("COACH");

        api.get(athlete, PROFILE)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.side").value("ATHLETE"))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.fitnessGoal").value("GENERAL_FITNESS"))
                .andExpect(jsonPath("$.missing[0]").value("BIRTH_DATE"))
                .andExpect(jsonPath("$.missing[1]").value("HEIGHT"))
                .andExpect(jsonPath("$.profile").doesNotExist());
        api.get(coach, PROFILE).andExpect(jsonPath("$.side").value("COACH"));
    }

    @Test
    void registeringCompletesTheAccountAndRequiresAnAdult() throws Exception {
        Registered athlete = api.register("ATHLETE");
        Map<String, Object> body = athleteProfile();

        body.remove("birthDate");
        api.put(athlete, PROFILE, body).andExpect(status().isBadRequest());
        body.put("birthDate", LocalDate.now().minusYears(12).toString());
        api.put(athlete, PROFILE, body).andExpect(status().isBadRequest());

        body.put("birthDate", LocalDate.now().minusYears(24).minusDays(1).toString());
        body.put("heightCm", 178.5);
        body.put("goals", List.of("ENDURANCE"));
        body.put("sessionRateEur", 80);
        body.put("sports", List.of("STRENGTH", "STRENGTH", "RUNNING"));
        api.put(athlete, PROFILE, body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(24))
                .andExpect(jsonPath("$.heightCm").value(178.5))
                .andExpect(jsonPath("$.missing.length()").value(0))
                .andExpect(jsonPath("$.profile.sports.length()").value(2))
                .andExpect(jsonPath("$.profile.goals.length()").value(0))
                .andExpect(jsonPath("$.profile.sessionRateEur").doesNotExist())
                .andExpect(jsonPath("$.profile.maxBudgetEur").value(50));

        api.get(athlete, "/api/users/me/profile").andExpect(jsonPath("$.heightCm").value(178.5));

        // Mise a jour sans date de naissance : celle du compte suffit desormais.
        body.remove("birthDate");
        body.put("headline", "Objectif semi-marathon");
        api.put(athlete, PROFILE, body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.headline").value("Objectif semi-marathon"));
    }

    @Test
    void invalidCodesAreRejected() throws Exception {
        Registered athlete = api.register("ATHLETE");
        Map<String, Object> body = athleteProfile();
        body.put("sports", List.of("QUIDDITCH"));
        api.put(athlete, PROFILE, body).andExpect(status().isBadRequest());

        body = athleteProfile();
        body.put("availability", List.of());
        api.put(athlete, PROFILE, body).andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------ fil

    @Test
    void theFeedOnlyShowsTheOtherSideWithACompatibilityScore() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered otherAthlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());

        JsonNode feed = api.json(api.get(athlete, FEED).andExpect(status().isOk()));
        feed.forEach(card -> assertThat(card.get("side").asText()).isEqualTo("COACH"));
        assertThat(cardOf(feed, athlete)).isNull();
        assertThat(cardOf(feed, otherAthlete)).isNull();

        JsonNode card = cardOf(feed, coach);
        assertThat(card).isNotNull();
        assertThat(card.get("score").asInt()).isEqualTo(100);
        assertThat(card.get("firstName").asText()).isEqualTo("Test");
        assertThat(card.get("age").asInt()).isEqualTo(31);
        assertThat(card.get("sessionRateEur").asInt()).isEqualTo(40);
        assertThat(card.has("lastName")).isFalse();
        assertThat(card.has("email")).isFalse();

        // Cote coach, l'athlete expose son objectif et son niveau, jamais son budget.
        JsonNode athleteCard = cardOf(api.json(api.get(coach, FEED)), athlete);
        assertThat(athleteCard.get("score").asInt()).isEqualTo(100);
        assertThat(athleteCard.get("goals").get(0).asText()).isEqualTo("GENERAL_FITNESS");
        assertThat(athleteCard.get("sessionRateEur").isNull()).isTrue();
        assertThat(athleteCard.has("maxBudgetEur")).isFalse();
    }

    @Test
    void theFeedRequiresAProfile() throws Exception {
        Registered athlete = api.register("ATHLETE");
        api.get(athlete, FEED).andExpect(status().isConflict());
    }

    @Test
    void hiddenProfilesLeaveTheFeed() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Map<String, Object> hidden = coachProfile();
        hidden.put("visible", false);
        Registered coach = member("COACH", hidden);

        assertThat(cardOf(api.json(api.get(athlete, FEED)), coach)).isNull();
    }

    @Test
    void aSuperLikeIsShownFirst() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());

        swipe(athlete, coach, "SUPER_LIKE");

        JsonNode first = api.json(api.get(coach, FEED)).get(0);
        assertThat(first.get("userId").asText()).isEqualTo(athlete.id().toString());
        assertThat(first.get("superLikedYou").asBoolean()).isTrue();
    }

    // --------------------------------------------------------------- swipes

    @Test
    void reciprocalLikesCreateAMatchThatUnlocksMessaging() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());

        JsonNode first = swipe(athlete, coach, "LIKE");
        assertThat(first.get("match").isNull()).isTrue();
        assertThat(first.get("newMatch").asBoolean()).isFalse();
        assertThat(cardOf(api.json(api.get(athlete, FEED)), coach)).isNull();

        // Sans match, pas de messagerie.
        api.post(athlete, CONVERSATIONS, Map.of("counterpartId", coach.id().toString()))
                .andExpect(status().isForbidden());

        JsonNode second = swipe(coach, athlete, "SUPER_LIKE");
        assertThat(second.get("newMatch").asBoolean()).isTrue();
        assertThat(second.get("match").get("counterpartId").asText()).isEqualTo(athlete.id().toString());
        assertThat(second.get("match").get("counterpartSide").asText()).isEqualTo("ATHLETE");
        String matchId = second.get("match").get("id").asText();

        // Rejouer le swipe ne recree rien.
        JsonNode replay = swipe(coach, athlete, "LIKE");
        assertThat(replay.get("newMatch").asBoolean()).isFalse();
        assertThat(replay.get("match").get("id").asText()).isEqualTo(matchId);

        api.get(athlete, MATCHES)
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(matchId))
                .andExpect(jsonPath("$[0].counterpartId").value(coach.id().toString()))
                .andExpect(jsonPath("$[0].counterpartHeadline").value("Coach force et remise en forme"));

        String conversationId = api.startConversation(athlete, coach);
        api.sendMessage(athlete, conversationId, "Salut, dispo jeudi soir ?");
        api.sendMessage(coach, conversationId, "Avec plaisir");

        // Defaire le match ferme l'envoi mais garde l'historique.
        api.delete(coach, MATCHES + "/" + matchId).andExpect(status().isNoContent());
        api.get(athlete, MATCHES).andExpect(jsonPath("$.length()").value(0));
        api.post(athlete, CONVERSATIONS + "/" + conversationId + "/messages", Map.of("body", "Allo ?"))
                .andExpect(status().isForbidden());
        api.get(athlete, CONVERSATIONS + "/" + conversationId + "/messages")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2));

        // Un match termine ne se recree pas.
        assertThat(swipe(athlete, coach, "LIKE").get("match").isNull()).isTrue();
        api.delete(coach, MATCHES + "/" + matchId).andExpect(status().isNotFound());
    }

    @Test
    void aPassPreventsTheMatchAndHidesThePasser() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());

        swipe(coach, athlete, "PASS");
        assertThat(cardOf(api.json(api.get(athlete, FEED)), coach)).isNull();
        assertThat(swipe(athlete, coach, "LIKE").get("match").isNull()).isTrue();

        // Changer d'avis est permis : la derniere decision l'emporte.
        assertThat(swipe(coach, athlete, "LIKE").get("newMatch").asBoolean()).isTrue();
    }

    @Test
    void swipesAreRestrictedToTheOtherSide() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered otherAthlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());
        Registered withoutProfile = api.register("COACH");

        Map<String, Object> toAthlete = Map.of("targetId", otherAthlete.id().toString(), "decision", "LIKE");
        api.post(athlete, SWIPES, toAthlete).andExpect(status().isBadRequest());
        api.post(athlete, SWIPES, Map.of("targetId", athlete.id().toString(), "decision", "LIKE"))
                .andExpect(status().isBadRequest());
        api.post(athlete, SWIPES, Map.of("targetId", withoutProfile.id().toString(), "decision", "LIKE"))
                .andExpect(status().isNotFound());
        api.post(athlete, SWIPES, Map.of("targetId", UUID.randomUUID().toString(), "decision", "LIKE"))
                .andExpect(status().isNotFound());
        api.post(withoutProfile, SWIPES, Map.of("targetId", athlete.id().toString(), "decision", "LIKE"))
                .andExpect(status().isConflict());
        api.post(athlete, SWIPES, Map.of("targetId", coach.id().toString(), "decision", "MAYBE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void onlyAMemberCanEndAMatch() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());
        Registered stranger = member("COACH", coachProfile());
        swipe(athlete, coach, "LIKE");
        String matchId = swipe(coach, athlete, "LIKE").get("match").get("id").asText();

        api.delete(stranger, MATCHES + "/" + matchId).andExpect(status().isNotFound());
        api.get(athlete, MATCHES).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void crossedLikesAtTheSameTimeCreateExactlyOneMatch() throws Exception {
        for (int round = 0; round < 5; round++) {
            Registered athlete = member("ATHLETE", athleteProfile());
            Registered coach = member("COACH", coachProfile());

            CountDownLatch start = new CountDownLatch(1);
            Callable<JsonNode> fromAthlete = () -> {
                start.await();
                return swipe(athlete, coach, "LIKE");
            };
            Callable<JsonNode> fromCoach = () -> {
                start.await();
                return swipe(coach, athlete, "LIKE");
            };

            ExecutorService executor = Executors.newFixedThreadPool(2);
            try {
                List<Future<JsonNode>> results = List.of(executor.submit(fromAthlete), executor.submit(fromCoach));
                start.countDown();
                List<JsonNode> responses = new ArrayList<>();
                for (Future<JsonNode> result : results) {
                    responses.add(result.get());
                }

                // Le premier swipe serialise ne voit pas encore l'autre ; le second cree le match.
                assertThat(responses).filteredOn(r -> r.get("newMatch").asBoolean()).hasSize(1);
                Integer rows = jdbc.queryForObject(
                        "SELECT count(*) FROM matches WHERE coach_id = ? AND athlete_id = ?",
                        Integer.class,
                        coach.id(),
                        athlete.id());
                assertThat(rows).isEqualTo(1);
            } finally {
                executor.shutdownNow();
            }
        }
    }

    // ------------------------------------------------- suites de la revue

    private String matchBetween(Registered athlete, Registered coach) throws Exception {
        swipe(athlete, coach, "LIKE");
        return swipe(coach, athlete, "LIKE").get("match").get("id").asText();
    }

    @Test
    void aMatchOnlyRevealsTheFirstNameInMessaging() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());
        matchBetween(athlete, coach);
        api.startConversation(athlete, coach);

        // Le nom de famille ("ATHLETE" / "COACH" pour les comptes de test) reste prive.
        api.get(athlete, CONVERSATIONS).andExpect(jsonPath("$[0].counterpartName").value("Test"));
        api.get(coach, CONVERSATIONS).andExpect(jsonPath("$[0].counterpartName").value("Test"));

        // Une relation de coaching active revele le nom complet, comme avant FitMatch.
        api.attachCoach(coach, athlete);
        api.get(athlete, CONVERSATIONS).andExpect(jsonPath("$[0].counterpartName").value("Test COACH"));
    }

    @Test
    void endingAMatchClosesConversationsThatWereNeverOpened() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());
        String matchId = matchBetween(athlete, coach);

        api.delete(athlete, MATCHES + "/" + matchId).andExpect(status().isNoContent());

        api.post(coach, CONVERSATIONS, Map.of("counterpartId", athlete.id().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void aPassAfterAMatchKeepsTheMatch() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());
        String matchId = matchBetween(athlete, coach);

        JsonNode pass = swipe(athlete, coach, "PASS");
        assertThat(pass.get("decision").asText()).isEqualTo("LIKE");
        assertThat(pass.get("newMatch").asBoolean()).isFalse();
        assertThat(pass.get("match").get("id").asText()).isEqualTo(matchId);
        api.get(athlete, MATCHES).andExpect(jsonPath("$[0].id").value(matchId));
    }

    @Test
    void suspendedAccountsLeaveTheFeedAndTheMatches() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());
        Registered other = member("COACH", coachProfile());
        matchBetween(athlete, coach);

        jdbc.update("UPDATE users SET status = 'SUSPENDED' WHERE id IN (?, ?)", coach.id(), other.id());

        assertThat(cardOf(api.json(api.get(athlete, FEED)), other)).isNull();
        api.get(athlete, MATCHES).andExpect(jsonPath("$.length()").value(0));
        api.post(athlete, SWIPES, Map.of("targetId", other.id().toString(), "decision", "LIKE"))
                .andExpect(status().isNotFound());
    }

    @Test
    void becomingTooYoungAfterRegistrationHidesTheProfile() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        Registered coach = member("COACH", coachProfile());

        api.patch(athlete, "/api/users/me/profile", Map.of("birthDate", LocalDate.now().minusYears(14).toString()))
                .andExpect(status().isOk());

        assertThat(cardOf(api.json(api.get(coach, FEED)), athlete)).isNull();
        api.get(athlete, FEED).andExpect(status().isBadRequest());
        api.post(coach, SWIPES, Map.of("targetId", athlete.id().toString(), "decision", "LIKE"))
                .andExpect(status().isNotFound());
    }

    @Test
    void fitMatchOnlyCompletesTheAccountAndUsesItsHeightRules() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        String birthDate = api.json(api.get(athlete, PROFILE)).get("birthDate").asText();

        Map<String, Object> body = athleteProfile();
        body.put("birthDate", LocalDate.now().minusYears(40).toString());
        body.put("heightCm", 280);
        api.put(athlete, PROFILE, body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.birthDate").value(birthDate))
                .andExpect(jsonPath("$.heightCm").value(280));

        // Une taille deja connue n'est plus ecrasee depuis FitMatch.
        body.put("heightCm", 170);
        api.put(athlete, PROFILE, body).andExpect(jsonPath("$.heightCm").value(280));

        body.put("heightCm", 178.55);
        api.put(athlete, PROFILE, body).andExpect(status().isBadRequest());
        body.put("birthDate", "1800-01-01");
        body.remove("heightCm");
        Registered fresh = api.register("ATHLETE");
        api.put(fresh, PROFILE, body).andExpect(status().isBadRequest());
    }

    @Test
    void theFeedSizeIsBounded() throws Exception {
        Registered athlete = member("ATHLETE", athleteProfile());
        member("COACH", coachProfile());
        member("COACH", coachProfile());

        assertThat(api.json(api.get(athlete, "/api/matching/feed?limit=0"))).hasSize(1);
        assertThat(api.json(api.get(athlete, "/api/matching/feed?limit=999")).size()).isBetween(2, 50);
    }

    @Test
    void concurrentFirstRegistrationsNeverEndInAServerError() throws Exception {
        Registered athlete = api.register("ATHLETE");
        CountDownLatch start = new CountDownLatch(1);
        Callable<Integer> put = () -> {
            start.await();
            return api.put(athlete, PROFILE, athleteProfile()).andReturn().getResponse().getStatus();
        };

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Future<Integer>> results = List.of(executor.submit(put), executor.submit(put));
            start.countDown();
            List<Integer> statuses = new ArrayList<>();
            for (Future<Integer> result : results) {
                statuses.add(result.get());
            }
            assertThat(statuses).allSatisfy(s -> assertThat(s).isIn(200, 409)).contains(200);
            Integer rows = jdbc.queryForObject(
                    "SELECT count(*) FROM match_profiles WHERE user_id = ?", Integer.class, athlete.id());
            assertThat(rows).isEqualTo(1);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void anAccountWithoutAthleteOrCoachRoleIsRefused() throws Exception {
        Registered admin = api.register("ATHLETE");
        jdbc.update("DELETE FROM user_roles WHERE user_id = ?", admin.id());
        jdbc.update("INSERT INTO user_roles (user_id, role_code) VALUES (?, 'ADMIN')", admin.id());
        // Les roles sont portes par le jeton : on se reconnecte pour en obtenir un nouveau.
        String token = api.json(api.post(null, "/api/auth/login", Map.of("email", admin.email(), "password", "Password1"))
                        .andExpect(status().isOk()))
                .get("accessToken")
                .asText();
        Registered relogged = new Registered(admin.id(), admin.email(), token);

        api.get(relogged, PROFILE).andExpect(status().isForbidden());
    }
}

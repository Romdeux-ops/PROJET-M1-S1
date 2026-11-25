package com.fitcoach.coaching;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Profil public d'un coach (cible du QR code) et demandes de suivi : seule l'acceptation du coach ouvre des droits. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CoachPublicProfileTests {

    private static final String SETTINGS = "/api/coaching/public-profile";
    private static final int RACERS = 4;
    private static final String REQUESTS = "/api/coaching/follow-requests";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private ApiClient api;
    private Registered coach;
    private Registered athlete;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiClient(mockMvc);
        coach = api.register("COACH");
        athlete = api.register("ATHLETE");
    }

    private String publicPath(Registered of) {
        return "/api/coaching/public/coaches/" + of.id();
    }

    private void publish() throws Exception {
        api.put(coach, SETTINGS, Map.of("enabled", true, "headline", "Préparateur physique", "bio", "Dix ans de musculation."))
                .andExpect(status().isOk());
    }

    private void request() throws Exception {
        api.post(athlete, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isCreated());
    }

    @Test
    void aProfileIsHiddenUntilTheCoachPublishesIt() throws Exception {
        api.get(null, publicPath(coach)).andExpect(status().isNotFound());
        api.get(coach, SETTINGS)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        publish();

        api.get(null, publicPath(coach))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(coach.id().toString()))
                .andExpect(jsonPath("$.headline").value("Préparateur physique"))
                .andExpect(jsonPath("$.bio").value("Dix ans de musculation."))
                .andExpect(jsonPath("$.viewerStatus").value("ANONYMOUS"))
                .andExpect(jsonPath("$.email").doesNotExist());

        api.put(coach, SETTINGS, Map.of("enabled", false)).andExpect(status().isOk());
        api.get(null, publicPath(coach)).andExpect(status().isNotFound());
    }

    @Test
    void unknownProfilesAndNonCoachAccountsAreNotFound() throws Exception {
        api.get(null, "/api/coaching/public/coaches/" + UUID.randomUUID()).andExpect(status().isNotFound());
        api.get(null, publicPath(athlete)).andExpect(status().isNotFound());
    }

    @Test
    void onlyACoachEditsItsSettingsAndTheTextIsBounded() throws Exception {
        api.put(athlete, SETTINGS, Map.of("enabled", true)).andExpect(status().isForbidden());
        api.get(athlete, SETTINGS).andExpect(status().isForbidden());
        api.put(coach, SETTINGS, Map.of("enabled", true, "headline", "x".repeat(121)))
                .andExpect(status().isBadRequest());
        api.put(coach, SETTINGS, Map.of("enabled", true, "bio", "x".repeat(1001)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void theViewerStatusFollowsTheRelation() throws Exception {
        publish();
        Registered otherCoach = api.register("COACH");

        api.get(coach, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("SELF"));
        api.get(otherCoach, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("NOT_ATHLETE"));
        api.get(athlete, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("NONE"));

        request();
        api.get(athlete, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("REQUESTED"));

        api.post(coach, REQUESTS + "/received/" + athlete.id() + "/accept", Map.of())
                .andExpect(status().isNoContent());
        api.get(athlete, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("ACTIVE"));
    }

    @Test
    void aFollowRequestIsAnsweredByTheCoach() throws Exception {
        publish();
        request();

        api.post(athlete, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isConflict());
        api.get(coach, REQUESTS + "/received")
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].athlete.id").value(athlete.id().toString()));
        api.get(athlete, REQUESTS + "/sent")
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].coach.id").value(coach.id().toString()));
        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(0));

        api.post(coach, REQUESTS + "/received/" + athlete.id() + "/accept", Map.of())
                .andExpect(status().isNoContent());

        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(1));
        api.get(athlete, "/api/coaching/coaches").andExpect(jsonPath("$.length()").value(1));
        api.get(coach, REQUESTS + "/received").andExpect(jsonPath("$.length()").value(0));
        api.post(athlete, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isConflict());
    }

    @Test
    void aDeclinedRequestGrantsNothingAndCanBeSentAgain() throws Exception {
        publish();
        request();

        api.post(coach, REQUESTS + "/received/" + athlete.id() + "/decline", Map.of())
                .andExpect(status().isNoContent());

        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(0));
        api.get(athlete, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("NONE"));
        request();
        api.get(coach, REQUESTS + "/received").andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void theAthleteCanWithdrawARequest() throws Exception {
        publish();
        request();

        api.delete(athlete, REQUESTS + "/sent/" + coach.id()).andExpect(status().isNoContent());

        api.get(athlete, REQUESTS + "/sent").andExpect(jsonPath("$.length()").value(0));
        api.get(coach, REQUESTS + "/received").andExpect(jsonPath("$.length()").value(0));
        api.delete(athlete, REQUESTS + "/sent/" + coach.id()).andExpect(status().isNotFound());
        request();
    }

    @Test
    void aRequestedRelationGrantsNoAccess() throws Exception {
        publish();
        request();

        api.get(athlete, "/api/coaching/posts/" + coach.id()).andExpect(status().isForbidden());

        api.post(coach, REQUESTS + "/received/" + athlete.id() + "/accept", Map.of())
                .andExpect(status().isNoContent());
        api.get(athlete, "/api/coaching/posts/" + coach.id()).andExpect(status().isOk());
    }

    @Test
    void onlyAthletesCanRequestAndOnlyFromAPublishedProfile() throws Exception {
        api.post(athlete, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isNotFound());

        publish();
        api.post(coach, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isForbidden());
        api.post(null, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isUnauthorized());
    }

    @Test
    void onlyTheRightPartyAnswersARequest() throws Exception {
        publish();
        request();
        Registered otherCoach = api.register("COACH");

        api.post(athlete, REQUESTS + "/received/" + athlete.id() + "/accept", Map.of())
                .andExpect(status().isForbidden());
        api.post(otherCoach, REQUESTS + "/received/" + athlete.id() + "/accept", Map.of())
                .andExpect(status().isNotFound());
        api.delete(coach, REQUESTS + "/sent/" + coach.id()).andExpect(status().isForbidden());
    }

    @Test
    void anInvitationAndARequestCannotOverlap() throws Exception {
        publish();
        api.invite(coach, athlete).andExpect(status().isCreated());
        api.post(athlete, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isConflict());

        Registered other = api.register("ATHLETE");
        api.post(other, publicPath(coach) + "/follow-requests", Map.of()).andExpect(status().isCreated());
        api.invite(coach, other).andExpect(status().isConflict());
    }

    @Test
    void theCoachIsNotifiedOfARequestAndTheAthleteOfTheAnswer() throws Exception {
        publish();
        request();

        api.get(coach, "/api/notifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type").value("FOLLOW_REQUESTED"))
                .andExpect(jsonPath("$.content[0].link").value("/coaching"));

        api.post(coach, REQUESTS + "/received/" + athlete.id() + "/accept", Map.of())
                .andExpect(status().isNoContent());
        api.get(athlete, "/api/notifications")
                .andExpect(jsonPath("$.content[0].type").value("FOLLOW_ACCEPTED"));
    }

    @Test
    void withdrawingARequestKeepsAnEndedOrDeclinedRelation() throws Exception {
        publish();
        api.attachCoach(coach, athlete);
        api.delete(athlete, "/api/coaching/coaches/" + coach.id()).andExpect(status().isNoContent());
        Map<String, Object> before = relationRow();
        assertEquals("ENDED", before.get("status"));

        request();
        api.delete(athlete, REQUESTS + "/sent/" + coach.id()).andExpect(status().isNoContent());

        Map<String, Object> after = relationRow();
        assertEquals("ENDED", after.get("status"));
        assertEquals(before.get("created_at"), after.get("created_at"));
        assertEquals(null, after.get("status_before_request"));
        api.get(athlete, publicPath(coach)).andExpect(jsonPath("$.viewerStatus").value("NONE"));
        request();

        api.post(coach, REQUESTS + "/received/" + athlete.id() + "/decline", Map.of())
                .andExpect(status().isNoContent());
        request();
        api.delete(athlete, REQUESTS + "/sent/" + coach.id()).andExpect(status().isNoContent());
        assertEquals("DECLINED", relationRow().get("status"));
    }

    @Test
    void aWithdrawnFirstRequestLeavesNoRelationBehind() throws Exception {
        publish();
        request();
        api.delete(athlete, REQUESTS + "/sent/" + coach.id()).andExpect(status().isNoContent());

        Integer rows = jdbc.queryForObject(
                "SELECT count(*) FROM coach_athlete WHERE coach_id = ? AND athlete_id = ?",
                Integer.class,
                coach.id(),
                athlete.id());
        assertEquals(0, rows);
    }

    @Test
    void twoSimultaneousRequestsNeverEndInAServerError() throws Exception {
        publish();
        ExecutorService pool = Executors.newFixedThreadPool(RACERS);
        try {
            for (int round = 0; round < 20; round++) {
                Registered racer = api.register("ATHLETE");
                CyclicBarrier start = new CyclicBarrier(RACERS);
                List<Future<Integer>> calls = new ArrayList<>();
                for (int i = 0; i < RACERS; i++) {
                    calls.add(pool.submit(() -> {
                        start.await();
                        return api.post(racer, publicPath(coach) + "/follow-requests", Map.of())
                                .andReturn()
                                .getResponse()
                                .getStatus();
                    }));
                }
                List<Integer> statuses = new ArrayList<>();
                for (Future<Integer> call : calls) {
                    statuses.add(call.get());
                }
                assertEquals(1, statuses.stream().filter(code -> code == 201).count(), statuses.toString());
                assertEquals(RACERS - 1, statuses.stream().filter(code -> code == 409).count(), statuses.toString());
            }
        } finally {
            pool.shutdownNow();
        }
    }

    private Map<String, Object> relationRow() {
        return jdbc.queryForMap(
                "SELECT status, created_at, status_before_request FROM coach_athlete WHERE coach_id = ? AND athlete_id = ?",
                coach.id(),
                athlete.id());
    }
}

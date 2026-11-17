package com.fitcoach.coaching;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Invitation coach -> athlete : seul ACTIVE ouvre des droits, PENDING / DECLINED / ENDED n'en ouvrent aucun. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CoachingInvitationTests {

    private static final String INVITATIONS = "/api/coaching/invitations";

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
    }

    private void accept(Registered by, Registered from) throws Exception {
        api.post(by, INVITATIONS + "/received/" + from.id() + "/accept", Map.of())
                .andExpect(status().isNoContent());
    }

    @Test
    void anInvitationIsPendingUntilTheAthleteAccepts() throws Exception {
        api.invite(coach, athlete)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.athlete.id").value(athlete.id().toString()))
                .andExpect(jsonPath("$.coach.id").value(coach.id().toString()));

        api.get(coach, INVITATIONS + "/sent")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].athlete.email").value(athlete.email()));
        api.get(athlete, INVITATIONS + "/received")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].coach.email").value(coach.email()));
        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(0));
        api.get(athlete, "/api/coaching/coaches").andExpect(jsonPath("$.length()").value(0));

        accept(athlete, coach);

        api.get(coach, "/api/coaching/athletes")
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(athlete.id().toString()));
        api.get(athlete, "/api/coaching/coaches")
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(coach.id().toString()));
        api.get(coach, INVITATIONS + "/sent").andExpect(jsonPath("$.length()").value(0));
        api.get(athlete, INVITATIONS + "/received").andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void aDeclinedInvitationGrantsNothingAndCanBeSentAgain() throws Exception {
        api.invite(coach, athlete).andExpect(status().isCreated());

        api.post(athlete, INVITATIONS + "/received/" + coach.id() + "/decline", Map.of())
                .andExpect(status().isNoContent());

        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(0));
        api.get(athlete, INVITATIONS + "/received").andExpect(jsonPath("$.length()").value(0));
        api.post(athlete, INVITATIONS + "/received/" + coach.id() + "/accept", Map.of())
                .andExpect(status().isNotFound());

        api.invite(coach, athlete).andExpect(status().isCreated());
        accept(athlete, coach);
        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void theCoachCanCancelAPendingInvitation() throws Exception {
        api.invite(coach, athlete).andExpect(status().isCreated());

        api.delete(coach, INVITATIONS + "/sent/" + athlete.id()).andExpect(status().isNoContent());

        api.get(athlete, INVITATIONS + "/received").andExpect(jsonPath("$.length()").value(0));
        api.post(athlete, INVITATIONS + "/received/" + coach.id() + "/accept", Map.of())
                .andExpect(status().isNotFound());
        api.delete(coach, INVITATIONS + "/sent/" + athlete.id()).andExpect(status().isNotFound());
    }

    @Test
    void anActiveRelationCannotBeCancelledAsAnInvitation() throws Exception {
        api.attachCoach(coach, athlete);

        api.delete(coach, INVITATIONS + "/sent/" + athlete.id()).andExpect(status().isNotFound());
        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void invitingTwiceOrInvitingAnActiveClientIsAConflict() throws Exception {
        api.invite(coach, athlete).andExpect(status().isCreated());
        api.invite(coach, athlete).andExpect(status().isConflict());

        accept(athlete, coach);
        api.invite(coach, athlete).andExpect(status().isConflict());
    }

    @Test
    void onlyTheInvitedAthleteCanRespond() throws Exception {
        api.invite(coach, athlete).andExpect(status().isCreated());
        Registered otherAthlete = api.register("ATHLETE");

        api.post(otherAthlete, INVITATIONS + "/received/" + coach.id() + "/accept", Map.of())
                .andExpect(status().isNotFound());
        api.post(coach, INVITATIONS + "/received/" + coach.id() + "/accept", Map.of())
                .andExpect(status().isForbidden());
        api.invite(athlete, otherAthlete).andExpect(status().isForbidden());
    }

    @Test
    void theInvitedEmailMustBelongToAnAthleteOtherThanTheCoach() throws Exception {
        Registered anotherCoach = api.register("COACH");

        api.invite(coach, anotherCoach).andExpect(status().isBadRequest());
        api.invite(coach, coach).andExpect(status().isBadRequest());
        api.post(coach, "/api/coaching/athletes", Map.of("athleteEmail", "inconnu@fitcoach.dev"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void eitherSideCanEndAnActiveRelationAndAccessIsLost() throws Exception {
        api.attachCoach(coach, athlete);
        String conversationId = api.startConversation(athlete, coach);
        api.post(coach, "/api/coaching/posts", Map.of("content", "Plan de la semaine")).andExpect(status().isCreated());
        api.get(athlete, "/api/coaching/posts/" + coach.id()).andExpect(status().isOk());

        api.delete(athlete, "/api/coaching/coaches/" + coach.id()).andExpect(status().isNoContent());

        api.get(athlete, "/api/coaching/posts/" + coach.id()).andExpect(status().isForbidden());
        api.get(coach, "/api/coaching/athletes").andExpect(jsonPath("$.length()").value(0));
        api.post(athlete, "/api/messaging/conversations/" + conversationId + "/messages", Map.of("body", "Salut"))
                .andExpect(status().isForbidden());
        api.delete(athlete, "/api/coaching/coaches/" + coach.id()).andExpect(status().isNotFound());

        api.invite(coach, athlete).andExpect(status().isCreated());
        accept(athlete, coach);
        api.delete(coach, "/api/coaching/athletes/" + athlete.id()).andExpect(status().isNoContent());
        api.get(athlete, "/api/coaching/posts/" + coach.id()).andExpect(status().isForbidden());
    }

    @Test
    void aPendingRelationGrantsNoAccessAnywhere() throws Exception {
        api.invite(coach, athlete).andExpect(status().isCreated());

        api.post(coach, "/api/coaching/posts", Map.of("content", "Reserve aux clients")).andExpect(status().isCreated());
        api.get(athlete, "/api/coaching/posts/" + coach.id()).andExpect(status().isForbidden());

        api.post(coach, "/api/messaging/conversations", Map.of("counterpartId", athlete.id().toString()))
                .andExpect(status().isForbidden());
        api.post(athlete, "/api/messaging/conversations", Map.of("counterpartId", coach.id().toString()))
                .andExpect(status().isForbidden());

        String scheduledId = api.schedule(athlete, LocalDate.now());
        api.get(coach, "/api/planning/pending-validations").andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/planning/scheduled/" + scheduledId + "/validate")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .csrf())
                        .header("Authorization", "Bearer " + coach.token()))
                .andExpect(status().isForbidden());
        api.get(coach, "/api/coaching/athletes/" + athlete.id() + "/overview").andExpect(status().isNotFound());
    }
}

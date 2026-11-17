package com.fitcoach.program;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Map;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Une invitation en attente ou refusee ne donne ni lecture ni notation d'un programme CLIENTS. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramClientsPendingRelationTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient api;

    @BeforeEach
    void setUp() {
        api = new ApiClient(mockMvc);
    }

    @Test
    void aPendingInvitationGrantsNoVisibilityAndNoRating() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.invite(coach, athlete).andExpect(status().isCreated());
        String programId = createClientsProgram(coach);

        assertNoAccess(athlete, programId);
    }

    @Test
    void aDeclinedInvitationGrantsNoVisibilityAndNoRating() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.invite(coach, athlete).andExpect(status().isCreated());
        api.post(athlete, "/api/coaching/invitations/received/" + coach.id() + "/decline", Map.of())
                .andExpect(status().isNoContent());
        String programId = createClientsProgram(coach);

        assertNoAccess(athlete, programId);
    }

    @Test
    void acceptingThePendingInvitationThenGrantsAccess() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.invite(coach, athlete).andExpect(status().isCreated());
        String programId = createClientsProgram(coach);
        assertNoAccess(athlete, programId);

        api.post(athlete, "/api/coaching/invitations/received/" + coach.id() + "/accept", Map.of())
                .andExpect(status().isNoContent());

        api.get(athlete, "/api/programs/" + programId).andExpect(status().isOk());
        api.post(athlete, "/api/programs/" + programId + "/ratings", Map.of("stars", 4, "comment", "ok"))
                .andExpect(status().isOk());
    }

    private void assertNoAccess(Registered athlete, String programId) throws Exception {
        String path = "/api/programs/" + programId;
        api.get(athlete, path).andExpect(status().isNotFound());
        api.post(athlete, path + "/ratings", Map.of("stars", 5, "comment", "ok")).andExpect(status().isNotFound());
        api.post(athlete, path + "/duplicate", Map.of()).andExpect(status().isNotFound());
        JsonNode fromCoaches = api.json(api.get(athlete, "/api/programs/from-my-coaches"));
        assertThat(StreamSupport.stream(fromCoaches.get("content").spliterator(), false)
                        .map(node -> node.get("id").asText()))
                .doesNotContain(programId);
    }

    private String createClientsProgram(Registered coach) throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Programme " + System.nanoTime(),
                "description", "Description.",
                "category", "STRENGTH",
                "level", "BEGINNER",
                "visibility", "CLIENTS");
        return api.json(api.post(coach, "/api/programs", body).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }
}

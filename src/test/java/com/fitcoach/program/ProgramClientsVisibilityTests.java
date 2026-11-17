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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Visibilite CLIENTS : un programme du coach visible par ses seuls athletes ACTIFS. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramClientsVisibilityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private ApiClient api;

    @BeforeEach
    void setUp() {
        api = new ApiClient(mockMvc);
    }

    @Test
    void athleteCannotChooseClientsVisibility() throws Exception {
        Registered athlete = api.register("ATHLETE");

        api.post(athlete, "/api/programs", programBody("CLIENTS")).andExpect(status().isForbidden());

        String ownId = createProgram(athlete, "PRIVATE");
        api.put(athlete, "/api/programs/" + ownId, programBody("CLIENTS")).andExpect(status().isForbidden());
    }

    @Test
    void coachCanChooseClientsVisibility() throws Exception {
        Registered coach = api.register("COACH");

        JsonNode created = api.json(api.post(coach, "/api/programs", programBody("CLIENTS"))
                .andExpect(status().isCreated()));

        assertThat(created.get("visibility").asText()).isEqualTo("CLIENTS");
    }

    @Test
    void onlyOwnerAndActiveClientsCanReadAClientsProgram() throws Exception {
        Registered coach = api.register("COACH");
        Registered otherCoach = api.register("COACH");
        Registered activeAthlete = api.register("ATHLETE");
        Registered unrelatedAthlete = api.register("ATHLETE");
        Registered otherCoachsAthlete = api.register("ATHLETE");
        api.attachCoach(coach, activeAthlete);
        api.attachCoach(otherCoach, otherCoachsAthlete);
        String programId = createProgram(coach, "CLIENTS");
        String path = "/api/programs/" + programId;

        api.get(coach, path).andExpect(status().isOk());
        api.get(activeAthlete, path).andExpect(status().isOk());
        api.get(unrelatedAthlete, path).andExpect(status().isNotFound());
        api.get(otherCoachsAthlete, path).andExpect(status().isNotFound());
        api.get(otherCoach, path).andExpect(status().isNotFound());
    }

    @Test
    void accessStopsAsSoonAsTheRelationEnds() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String programId = createProgram(coach, "CLIENTS");

        api.get(athlete, "/api/programs/" + programId).andExpect(status().isOk());
        assertThat(idsOf(api.json(api.get(athlete, "/api/programs/from-my-coaches")))).contains(programId);

        jdbcTemplate.update(
                "UPDATE coach_athlete SET status = 'ENDED' WHERE coach_id = ? AND athlete_id = ?",
                coach.id(),
                athlete.id());

        api.get(athlete, "/api/programs/" + programId).andExpect(status().isNotFound());
        assertThat(idsOf(api.json(api.get(athlete, "/api/programs/from-my-coaches")))).doesNotContain(programId);
        api.post(athlete, "/api/programs/" + programId + "/duplicate", Map.of()).andExpect(status().isNotFound());
    }

    @Test
    void fromMyCoachesListsOnlyClientsProgramsOfActiveCoaches() throws Exception {
        Registered coach = api.register("COACH");
        Registered otherCoach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        Registered unrelatedAthlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String clientsProgram = createProgram(coach, "CLIENTS");
        String privateProgram = createProgram(coach, "PRIVATE");
        String publicProgram = createProgram(coach, "PUBLIC");
        String otherCoachsClientsProgram = createProgram(otherCoach, "CLIENTS");

        var fromCoaches = idsOf(api.json(api.get(athlete, "/api/programs/from-my-coaches")
                .andExpect(status().isOk())));
        assertThat(fromCoaches)
                .contains(clientsProgram)
                .doesNotContain(privateProgram, publicProgram, otherCoachsClientsProgram);

        assertThat(idsOf(api.json(api.get(unrelatedAthlete, "/api/programs/from-my-coaches"))))
                .doesNotContain(clientsProgram);
    }

    @Test
    void clientsProgramsDoNotLeakInTheGeneralSearch() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        Registered stranger = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String programId = createProgram(coach, "CLIENTS");

        assertThat(idsOf(api.json(api.get(stranger, "/api/programs?size=100")))).doesNotContain(programId);
        assertThat(idsOf(api.json(api.get(athlete, "/api/programs?size=100")))).doesNotContain(programId);
        assertThat(idsOf(api.json(api.get(coach, "/api/programs?mineOnly=true&size=100")))).contains(programId);
    }

    @Test
    void anActiveAthleteCanDuplicateAClientsProgramIntoAPrivateCopy() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        Registered stranger = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String programId = createProgram(coach, "CLIENTS");

        JsonNode copy = api.json(api.post(athlete, "/api/programs/" + programId + "/duplicate", Map.of())
                .andExpect(status().isCreated()));

        assertThat(copy.get("visibility").asText()).isEqualTo("PRIVATE");
        assertThat(copy.get("ownerId").asText()).isEqualTo(athlete.id().toString());
        assertThat(copy.get("mine").asBoolean()).isTrue();

        api.post(stranger, "/api/programs/" + programId + "/duplicate", Map.of()).andExpect(status().isNotFound());
    }

    @Test
    void editingDeletingAndRatingStayRestricted() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String programId = createProgram(coach, "CLIENTS");
        String path = "/api/programs/" + programId;

        api.put(athlete, path, programBody("PRIVATE")).andExpect(status().isForbidden());
        api.delete(athlete, path).andExpect(status().isForbidden());
        api.post(athlete, path + "/ratings", Map.of("stars", 5, "comment", "top")).andExpect(status().isBadRequest());
        api.get(coach, path).andExpect(status().isOk());
    }

    @Test
    void shareLinkKeepsItsCurrentBehavior() throws Exception {
        Registered coach = api.register("COACH");
        JsonNode created = api.json(api.post(coach, "/api/programs", programBody("CLIENTS"))
                .andExpect(status().isCreated()));

        api.get(null, "/api/programs/shared/" + created.get("shareToken").asText()).andExpect(status().isOk());
    }

    private String createProgram(Registered user, String visibility) throws Exception {
        return api.json(api.post(user, "/api/programs", programBody(visibility)).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    private static Map<String, Object> programBody(String visibility) {
        return Map.of(
                "title", "Programme " + System.nanoTime(),
                "description", "Description.",
                "category", "STRENGTH",
                "level", "BEGINNER",
                "visibility", visibility);
    }

    private static java.util.List<String> idsOf(JsonNode page) {
        return StreamSupport.stream(page.get("content").spliterator(), false)
                .map(node -> node.get("id").asText())
                .toList();
    }
}

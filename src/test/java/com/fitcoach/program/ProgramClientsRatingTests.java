package com.fitcoach.program;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Notation des programmes CLIENTS : athletes a relation ACTIVE seulement, jamais le proprietaire. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramClientsRatingTests {

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
    void anActiveAthleteCanRateAndChangeTheirRatingWithoutDoubleCounting() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String path = "/api/programs/" + createProgram(coach, "CLIENTS");

        JsonNode first = api.json(api.post(athlete, path + "/ratings", rating(5)).andExpect(status().isOk()));
        assertThat(first.get("averageRating").asDouble()).isEqualTo(5.0);
        assertThat(first.get("ratingsCount").asInt()).isEqualTo(1);

        JsonNode second = api.json(api.post(athlete, path + "/ratings", rating(3)).andExpect(status().isOk()));
        assertThat(second.get("averageRating").asDouble()).isEqualTo(3.0);
        assertThat(second.get("ratingsCount").asInt()).isEqualTo(1);
    }

    @Test
    void theOwnerCannotRateTheirOwnClientsProgramButSeesTheAverage() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String path = "/api/programs/" + createProgram(coach, "CLIENTS");
        api.post(athlete, path + "/ratings", rating(4)).andExpect(status().isOk());

        api.post(coach, path + "/ratings", rating(5)).andExpect(status().isBadRequest());

        JsonNode asOwner = api.json(api.get(coach, path).andExpect(status().isOk()));
        assertThat(asOwner.get("averageRating").asDouble()).isEqualTo(4.0);
        assertThat(asOwner.get("ratingsCount").asInt()).isEqualTo(1);
        assertThat(asOwner.get("mine").asBoolean()).isTrue();
    }

    @Test
    void nobodyWithoutAnActiveRelationCanRateAClientsProgram() throws Exception {
        Registered coach = api.register("COACH");
        Registered otherCoach = api.register("COACH");
        Registered neverAttached = api.register("ATHLETE");
        Registered otherCoachsAthlete = api.register("ATHLETE");
        api.attachCoach(otherCoach, otherCoachsAthlete);
        String path = "/api/programs/" + createProgram(coach, "CLIENTS");

        api.post(neverAttached, path + "/ratings", rating(5)).andExpect(status().isNotFound());
        api.post(otherCoachsAthlete, path + "/ratings", rating(5)).andExpect(status().isNotFound());
        api.post(otherCoach, path + "/ratings", rating(5)).andExpect(status().isNotFound());

        JsonNode asOwner = api.json(api.get(coach, path));
        assertThat(asOwner.get("ratingsCount").asInt()).isZero();
    }

    @Test
    void anEndedRelationKeepsTheRatingInTheAverageButCannotChangeItAnymore() throws Exception {
        Registered coach = api.register("COACH");
        Registered leaving = api.register("ATHLETE");
        Registered staying = api.register("ATHLETE");
        api.attachCoach(coach, leaving);
        api.attachCoach(coach, staying);
        String path = "/api/programs/" + createProgram(coach, "CLIENTS");
        api.post(leaving, path + "/ratings", rating(4)).andExpect(status().isOk());
        api.post(staying, path + "/ratings", rating(2)).andExpect(status().isOk());

        jdbcTemplate.update(
                "UPDATE coach_athlete SET status = 'ENDED' WHERE coach_id = ? AND athlete_id = ?",
                coach.id(),
                leaving.id());

        api.post(leaving, path + "/ratings", rating(1)).andExpect(status().isNotFound());
        api.get(leaving, path).andExpect(status().isNotFound());

        JsonNode asOwner = api.json(api.get(coach, path).andExpect(status().isOk()));
        assertThat(asOwner.get("ratingsCount").asInt()).isEqualTo(2);
        assertThat(asOwner.get("averageRating").asDouble()).isCloseTo(3.0, within(0.001));

        JsonNode asStaying = api.json(api.get(staying, path).andExpect(status().isOk()));
        assertThat(asStaying.get("ratingsCount").asInt()).isEqualTo(2);
    }

    @Test
    void privateStaysUnratableAndPublicIsUnchanged() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String privatePath = "/api/programs/" + createProgram(coach, "PRIVATE");
        String publicPath = "/api/programs/" + createProgram(coach, "PUBLIC");

        // Invisible pour l'athlete : 404 (avant : 400, qui revelait l'existence du programme prive).
        api.post(athlete, privatePath + "/ratings", rating(5)).andExpect(status().isNotFound());
        // Visible pour son proprietaire : la regle « seuls les programmes publics » s'applique (400).
        api.post(coach, privatePath + "/ratings", rating(5)).andExpect(status().isBadRequest());

        api.post(athlete, publicPath + "/ratings", rating(5)).andExpect(status().isOk());
        api.post(coach, publicPath + "/ratings", rating(5)).andExpect(status().isBadRequest());
        JsonNode publicProgram = api.json(api.get(coach, publicPath));
        assertThat(publicProgram.get("ratingsCount").asInt()).isEqualTo(1);
    }

    @Test
    void theCoachSeesTheAverageOnTheirClientsProgramsInTheList() throws Exception {
        Registered coach = api.register("COACH");
        Registered athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
        String programId = createProgram(coach, "CLIENTS");
        api.post(athlete, "/api/programs/" + programId + "/ratings", rating(5)).andExpect(status().isOk());

        JsonNode listed = null;
        for (JsonNode node : api.json(api.get(coach, "/api/programs?mineOnly=true&size=100")).get("content")) {
            if (node.get("id").asText().equals(programId)) {
                listed = node;
            }
        }
        assertThat(listed).isNotNull();
        assertThat(listed.get("averageRating").asDouble()).isEqualTo(5.0);
        assertThat(listed.get("ratingsCount").asInt()).isEqualTo(1);
    }

    private String createProgram(Registered user, String visibility) throws Exception {
        return api.json(api.post(user, "/api/programs", programBody(visibility)).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    private static Map<String, Object> rating(int stars) {
        return Map.of("stars", stars, "comment", "ok");
    }

    private static Map<String, Object> programBody(String visibility) {
        return Map.of(
                "title", "Programme " + System.nanoTime(),
                "description", "Description.",
                "category", "STRENGTH",
                "level", "BEGINNER",
                "visibility", visibility);
    }
}

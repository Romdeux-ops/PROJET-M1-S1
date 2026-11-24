package com.fitcoach.coaching;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Notes privees du coach et tableau de suivi d'un athlete : reserves au coach de la relation active. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CoachFollowUpTests {

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
        api.attachCoach(coach, athlete);
    }

    private String notes(Registered athleteOfNotes) {
        return "/api/coaching/athletes/" + athleteOfNotes.id() + "/notes";
    }

    private String createNote(String content) throws Exception {
        return api.json(api.post(coach, notes(athlete), Map.of("content", content)).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    @Test
    void aCoachCreatesEditsListsAndDeletesItsNotes() throws Exception {
        String noteId = createNote("Douleur a l'epaule gauche");
        createNote("Reprise progressive");

        api.get(coach, notes(athlete))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].content").value("Reprise progressive"));

        api.put(coach, notes(athlete) + "/" + noteId, Map.of("content", "Epaule guerie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Epaule guerie"));

        api.delete(coach, notes(athlete) + "/" + noteId).andExpect(status().isNoContent());
        api.get(coach, notes(athlete)).andExpect(jsonPath("$.totalElements").value(1));
        api.delete(coach, notes(athlete) + "/" + noteId).andExpect(status().isNotFound());
    }

    @Test
    void emptyOrOversizedNotesAreRejected() throws Exception {
        api.post(coach, notes(athlete), Map.of("content", "  ")).andExpect(status().isBadRequest());
        api.post(coach, notes(athlete), Map.of("content", "x".repeat(5001))).andExpect(status().isBadRequest());
    }

    @Test
    void theAthleteNeverSeesNorTouchesTheNotes() throws Exception {
        String noteId = createNote("Confidentiel");

        api.get(athlete, notes(athlete)).andExpect(status().isForbidden());
        api.post(athlete, notes(athlete), Map.of("content", "Je m'en ajoute")).andExpect(status().isForbidden());
        api.put(athlete, notes(athlete) + "/" + noteId, Map.of("content", "Modifie")).andExpect(status().isForbidden());
        api.delete(athlete, notes(athlete) + "/" + noteId).andExpect(status().isForbidden());

        Integer stored = jdbc.queryForObject(
                "SELECT count(*) FROM coach_notes WHERE id = ?::uuid AND content = 'Confidentiel'", Integer.class, noteId);
        assertThat(stored).isEqualTo(1);
    }

    @Test
    void anotherCoachCannotReadNorChangeTheNotes() throws Exception {
        String noteId = createNote("Reserve a son auteur");
        Registered otherCoach = api.register("COACH");

        api.get(otherCoach, notes(athlete)).andExpect(jsonPath("$.totalElements").value(0));
        api.post(otherCoach, notes(athlete), Map.of("content", "Intrus")).andExpect(status().isNotFound());
        api.put(otherCoach, notes(athlete) + "/" + noteId, Map.of("content", "Intrus")).andExpect(status().isNotFound());
        api.delete(otherCoach, notes(athlete) + "/" + noteId).andExpect(status().isNotFound());
    }

    @Test
    void anEndedRelationKeepsTheHistoryButBlocksNewOrEditedNotes() throws Exception {
        String noteId = createNote("Avant la fin");
        api.delete(coach, "/api/coaching/athletes/" + athlete.id()).andExpect(status().isNoContent());

        api.get(coach, notes(athlete)).andExpect(jsonPath("$.totalElements").value(1));
        api.post(coach, notes(athlete), Map.of("content", "Apres la fin")).andExpect(status().isNotFound());
        api.put(coach, notes(athlete) + "/" + noteId, Map.of("content", "Retouche")).andExpect(status().isNotFound());
        api.delete(coach, notes(athlete) + "/" + noteId).andExpect(status().isNoContent());
    }

    @Test
    void theOverviewSummarisesTheAthletesActivity() throws Exception {
        api.createSession(athlete, Instant.now(), 45);
        api.createSession(athlete, Instant.now().minus(2, ChronoUnit.DAYS), 30);
        api.schedule(athlete, LocalDate.now().plusDays(1));
        String completedId = api.schedule(athlete, LocalDate.now());
        String workoutId = api.createSession(athlete, Instant.now(), 20);
        api.patch(athlete, "/api/planning/scheduled/" + completedId + "/complete", Map.of("workoutSessionId", workoutId))
                .andExpect(status().isOk());

        JsonNode overview = api.json(api.get(coach, "/api/coaching/athletes/" + athlete.id() + "/overview")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.athlete.id").value(athlete.id().toString())));

        assertThat(overview.get("sessionsLast30Days").asInt()).isEqualTo(3);
        assertThat(overview.get("currentStreakDays").asInt()).isGreaterThanOrEqualTo(1);
        assertThat(overview.get("lastSessionDate").asText()).isNotBlank();
        assertThat(overview.get("pendingValidations").asInt()).isEqualTo(1);
        assertThat(overview.get("upcomingSessions")).hasSize(1);
    }

    @Test
    void theOverviewOfAnAthleteWithoutActivityIsEmpty() throws Exception {
        api.get(coach, "/api/coaching/athletes/" + athlete.id() + "/overview")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionsLast30Days").value(0))
                .andExpect(jsonPath("$.lastSessionDate").doesNotExist())
                .andExpect(jsonPath("$.pendingValidations").value(0))
                .andExpect(jsonPath("$.upcomingSessions.length()").value(0));
    }

    @Test
    void theOverviewIsReservedToTheActiveCoach() throws Exception {
        String path = "/api/coaching/athletes/" + athlete.id() + "/overview";
        Registered otherCoach = api.register("COACH");

        api.get(athlete, path).andExpect(status().isForbidden());
        api.get(otherCoach, path).andExpect(status().isNotFound());

        api.delete(coach, "/api/coaching/athletes/" + athlete.id()).andExpect(status().isNoContent());
        api.get(coach, path).andExpect(status().isNotFound());
    }
}

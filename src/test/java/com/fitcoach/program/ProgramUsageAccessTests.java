package com.fitcoach.program;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * Planifier ou enregistrer une seance sur un programme suppose de pouvoir le voir. Un programme
 * invisible et un identifiant inconnu donnent la meme reponse (404), sans reveler l'existence.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramUsageAccessTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient api;
    private Registered owner;
    private Registered stranger;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiClient(mockMvc);
        owner = api.register("COACH");
        stranger = api.register("ATHLETE");
    }

    private JsonNode createProgram(Registered user, String visibility) throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Programme " + System.nanoTime(),
                "category", "STRENGTH",
                "level", "BEGINNER",
                "visibility", visibility);
        JsonNode program = api.json(api.post(user, "/api/programs", body).andExpect(status().isCreated()));
        return api.json(api.post(user, "/api/programs/" + program.get("id").asText() + "/days",
                        Map.of("name", "Jour 1", "restDay", false))
                .andExpect(status().isOk()));
    }

    private static String dayOf(JsonNode program) {
        return program.get("days").get(0).get("id").asText();
    }

    private ResultActions schedule(Registered user, String programId, String dayId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("title", "Seance " + System.nanoTime());
        body.put("scheduledDate", LocalDate.now().plusDays(2).toString());
        body.put("programId", programId);
        body.put("programDayId", dayId);
        return api.post(user, "/api/planning/scheduled", body);
    }

    private ResultActions logSession(Registered user, String programId, String dayId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("title", "Seance " + System.nanoTime());
        body.put("performedAt", Instant.now().minusSeconds(3600).toString());
        body.put("programId", programId);
        body.put("programDayId", dayId);
        return api.post(user, "/api/training/sessions", body);
    }

    @Test
    void privateProgramOfAnotherUserCannotBeUsedAndLooksLikeAnUnknownId() throws Exception {
        JsonNode program = createProgram(owner, "PRIVATE");
        String id = program.get("id").asText();
        String unknown = UUID.randomUUID().toString();

        JsonNode hidden = api.json(schedule(stranger, id, dayOf(program)).andExpect(status().isNotFound()));
        JsonNode missing = api.json(schedule(stranger, unknown, null).andExpect(status().isNotFound()));
        assertThat(hidden.get("detail").asText()).isEqualTo(missing.get("detail").asText());

        logSession(stranger, id, dayOf(program)).andExpect(status().isNotFound());
        logSession(stranger, unknown, null).andExpect(status().isNotFound());
    }

    @Test
    void dayMustBelongToTheProgram() throws Exception {
        JsonNode first = createProgram(owner, "PRIVATE");
        JsonNode second = createProgram(owner, "PRIVATE");

        schedule(owner, first.get("id").asText(), dayOf(second)).andExpect(status().isBadRequest());
        logSession(owner, first.get("id").asText(), dayOf(second)).andExpect(status().isBadRequest());
        schedule(owner, null, dayOf(first)).andExpect(status().isBadRequest());
        logSession(owner, null, dayOf(first)).andExpect(status().isBadRequest());
    }

    @Test
    void visibleProgramsCanBeUsed() throws Exception {
        JsonNode own = createProgram(owner, "PRIVATE");
        schedule(owner, own.get("id").asText(), dayOf(own)).andExpect(status().isCreated());
        logSession(owner, own.get("id").asText(), dayOf(own)).andExpect(status().isCreated());

        JsonNode publicProgram = createProgram(owner, "PUBLIC");
        schedule(stranger, publicProgram.get("id").asText(), dayOf(publicProgram)).andExpect(status().isCreated());
        logSession(stranger, publicProgram.get("id").asText(), null).andExpect(status().isCreated());
    }

    @Test
    void coachProgramForClientsIsUsableOnlyByAnActiveAthlete() throws Exception {
        JsonNode shared = createProgram(owner, "CLIENTS");
        String id = shared.get("id").asText();

        schedule(stranger, id, dayOf(shared)).andExpect(status().isNotFound());

        api.attachCoach(owner, stranger);
        schedule(stranger, id, dayOf(shared)).andExpect(status().isCreated());
        logSession(stranger, id, dayOf(shared)).andExpect(status().isCreated());
    }
}

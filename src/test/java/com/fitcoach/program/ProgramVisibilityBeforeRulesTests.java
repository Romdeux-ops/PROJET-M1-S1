package com.fitcoach.program;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * La visibilite est verifiee avant toute autre regle : un programme invisible renvoie 404 quelle
 * que soit l'action (noter, modifier, supprimer, dupliquer). Le 403 ne concerne qu'un programme
 * visible mais pas modifiable, et le 400 « seuls les programmes publics » un programme visible.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramVisibilityBeforeRulesTests {

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

    private String createProgram(String visibility) throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Programme " + System.nanoTime(),
                "category", "STRENGTH",
                "level", "BEGINNER",
                "visibility", visibility);
        return api.json(api.post(owner, "/api/programs", body).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    private Map<String, Object> update() {
        return Map.of("title", "Renomme", "category", "STRENGTH", "level", "BEGINNER", "visibility", "PRIVATE");
    }

    @Test
    void invisibleProgramIsNotFoundForEveryAction() throws Exception {
        String id = createProgram("PRIVATE");

        api.post(stranger, "/api/programs/" + id + "/ratings", Map.of("stars", 4)).andExpect(status().isNotFound());
        api.put(stranger, "/api/programs/" + id, update()).andExpect(status().isNotFound());
        api.delete(stranger, "/api/programs/" + id).andExpect(status().isNotFound());
        api.post(stranger, "/api/programs/" + id + "/duplicate", Map.of()).andExpect(status().isNotFound());
        api.post(stranger, "/api/programs/" + id + "/days", Map.of("name", "J", "restDay", false))
                .andExpect(status().isNotFound());
    }

    @Test
    void visibleButNotOwnedProgramIsForbiddenToModify() throws Exception {
        String publicId = createProgram("PUBLIC");
        api.put(stranger, "/api/programs/" + publicId, update()).andExpect(status().isForbidden());
        api.delete(stranger, "/api/programs/" + publicId).andExpect(status().isForbidden());

        String clientsId = createProgram("CLIENTS");
        api.attachCoach(owner, stranger);
        api.put(stranger, "/api/programs/" + clientsId, update()).andExpect(status().isForbidden());
    }

    @Test
    void ownerGetsBusinessErrorsOnlyOnProgramsTheyCanSee() throws Exception {
        String privateId = createProgram("PRIVATE");
        api.post(owner, "/api/programs/" + privateId + "/ratings", Map.of("stars", 4))
                .andExpect(status().isBadRequest());

        String publicId = createProgram("PUBLIC");
        api.post(owner, "/api/programs/" + publicId + "/ratings", Map.of("stars", 4))
                .andExpect(status().isBadRequest());
    }
}

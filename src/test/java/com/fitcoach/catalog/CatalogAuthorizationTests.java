package com.fitcoach.catalog;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Regle la plus sensible du projet : qui peut gerer le catalogue d'exercices.
 * Un coach ne peut modifier/supprimer que les exercices qu'il a crees ; un
 * athlete ne peut rien creer.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogAuthorizationTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private ObjectNode exerciseBody(String name) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("name", name);
        body.put("description", "Description de test.");
        body.put("equipment", "Aucun");
        body.put("difficulty", "BEGINNER");
        body.put("defaultRestSeconds", 60);
        body.putArray("muscles");
        body.putArray("tagIds");
        body.putArray("alternativeExerciseIds");
        return body;
    }

    private String createExerciseAs(Registered coach, String name) throws Exception {
        String response = mockMvc.perform(post("/api/catalog/exercises")
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exerciseBody(name))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        return node.get("id").asText();
    }

    @Test
    void athleteCannotCreateExercise() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");

        mockMvc.perform(post("/api/catalog/exercises")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exerciseBody("Tentative athlete"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void coachCannotModifyAnotherCoachsExercise() throws Exception {
        Registered coachA = TestUsers.register(mockMvc, objectMapper, "COACH");
        Registered coachB = TestUsers.register(mockMvc, objectMapper, "COACH");
        String exerciseId = createExerciseAs(coachA, "Exercice de coachA " + System.nanoTime());

        mockMvc.perform(put("/api/catalog/exercises/" + exerciseId)
                        .with(csrf())
                        .header("Authorization", "Bearer " + coachB.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exerciseBody("Modifie par coachB"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/catalog/exercises/" + exerciseId)
                        .with(csrf())
                        .header("Authorization", "Bearer " + coachB.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void coachCanModifyOwnExercise() throws Exception {
        Registered coach = TestUsers.register(mockMvc, objectMapper, "COACH");
        String exerciseId = createExerciseAs(coach, "Exercice propre " + System.nanoTime());

        mockMvc.perform(put("/api/catalog/exercises/" + exerciseId)
                        .with(csrf())
                        .header("Authorization", "Bearer " + coach.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exerciseBody("Nom modifie"))))
                .andExpect(status().isOk());
    }
}

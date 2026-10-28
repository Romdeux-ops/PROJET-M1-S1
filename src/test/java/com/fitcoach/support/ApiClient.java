package com.fitcoach.support;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitcoach.support.TestUsers.Registered;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/**
 * Appels HTTP de test au nom d'un utilisateur ({@code null} = anonyme), plus
 * quelques raccourcis pour creer les donnees d'un scenario via la vraie API.
 */
public final class ApiClient {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ApiClient(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    public Registered register(String role) throws Exception {
        return TestUsers.register(mockMvc, objectMapper, role);
    }

    public ResultActions get(Registered user, String path) throws Exception {
        return perform(user, MockMvcRequestBuilders.get(path));
    }

    public ResultActions delete(Registered user, String path) throws Exception {
        return perform(user, MockMvcRequestBuilders.delete(path).with(csrf()));
    }

    public ResultActions post(Registered user, String path, Object body) throws Exception {
        return perform(user, withJson(MockMvcRequestBuilders.post(path), body));
    }

    public ResultActions put(Registered user, String path, Object body) throws Exception {
        return perform(user, withJson(MockMvcRequestBuilders.put(path), body));
    }

    public ResultActions patch(Registered user, String path, Object body) throws Exception {
        return perform(user, withJson(MockMvcRequestBuilders.patch(path), body));
    }

    public ResultActions perform(Registered user, AbstractMockHttpServletRequestBuilder<?> request) throws Exception {
        if (user != null) {
            request.header("Authorization", "Bearer " + user.token());
        }
        return mockMvc.perform(request);
    }

    public JsonNode json(ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }

    public String createExercise(Registered coach) throws Exception {
        Map<String, Object> body = Map.of(
                "name", "Exercice " + System.nanoTime(),
                "description", "d",
                "equipment", "aucun",
                "difficulty", "BEGINNER",
                "defaultRestSeconds", 60,
                "muscles", new Object[0],
                "tagIds", new Object[0],
                "alternativeExerciseIds", new Object[0]);
        return json(post(coach, "/api/catalog/exercises", body).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    public String createSession(Registered athlete, Instant performedAt, int durationMinutes) throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Seance " + System.nanoTime(),
                "performedAt", performedAt.toString(),
                "durationMinutes", durationMinutes);
        return json(post(athlete, "/api/training/sessions", body).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    public JsonNode addSet(Registered athlete, String sessionId, String exerciseId, int reps, String weightKg)
            throws Exception {
        Map<String, Object> body =
                Map.of("exerciseId", exerciseId, "setNumber", 1, "reps", reps, "weightKg", weightKg);
        return json(post(athlete, "/api/training/sessions/" + sessionId + "/sets", body)
                .andExpect(status().isOk()));
    }

    public void attachCoach(Registered coach, Registered athlete) throws Exception {
        post(coach, "/api/coaching/athletes", Map.of("athleteEmail", athlete.email()))
                .andExpect(status().isCreated());
    }

    public String schedule(Registered athlete, LocalDate date) throws Exception {
        Map<String, Object> body = Map.of("title", "Planifiee " + System.nanoTime(), "scheduledDate", date.toString());
        return json(post(athlete, "/api/planning/scheduled", body).andExpect(status().isCreated()))
                .get("id")
                .asText();
    }

    private MockHttpServletRequestBuilder withJson(MockHttpServletRequestBuilder request, Object body)
            throws Exception {
        return request.with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
    }
}

package com.fitcoach.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/** {@code %}, {@code _} et {@code \} sont cherches litteralement, pas comme jokers SQL. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogSearchEscapingTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void likeWildcardsAreMatchedLiterally() throws Exception {
        ApiClient client = new ApiClient(mockMvc);
        Registered coach = client.register("COACH");
        String marker = "z" + System.nanoTime();
        String name = "Tirage " + marker + "_%x\\y";
        Map<String, Object> body = Map.of(
                "name", name,
                "description", "d",
                "equipment", "aucun",
                "difficulty", "BEGINNER",
                "defaultRestSeconds", 60,
                "muscles", new Object[0],
                "tagIds", new Object[0],
                "alternativeExerciseIds", new Object[0]);
        client.post(coach, "/api/catalog/exercises", body).andExpect(status().isCreated());

        assertThat(search(client, coach, "_%x")).contains(name).allMatch(n -> n.contains("_%x"));
        assertThat(search(client, coach, "x\\y")).contains(name).allMatch(n -> n.contains("x\\y"));
        assertThat(search(client, coach, marker + "_%x\\y")).containsExactly(name);
        assertThat(search(client, coach, marker + "%")).isEmpty();
    }

    @Test
    void ordinarySearchStillWorks() throws Exception {
        ApiClient client = new ApiClient(mockMvc);
        Registered athlete = client.register("ATHLETE");
        assertThat(search(client, athlete, "couche")).contains("Developpe couche");
    }

    private static java.util.List<String> search(ApiClient client, Registered user, String query) throws Exception {
        JsonNode page = client.json(client.perform(
                        user,
                        MockMvcRequestBuilders.get("/api/catalog/exercises")
                                .param("size", "100")
                                .param("query", query))
                .andExpect(status().isOk()));
        java.util.List<String> names = new java.util.ArrayList<>();
        page.get("content").forEach(e -> names.add(e.get("name").asText()));
        return names;
    }
}

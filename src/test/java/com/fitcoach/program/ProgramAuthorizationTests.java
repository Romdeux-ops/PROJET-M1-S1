package com.fitcoach.program;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

/** Un programme PRIVATE d'autrui doit renvoyer 404, jamais 403 (pattern "ownership via 404"). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramAuthorizationTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void privateProgramOfAnotherUserReturnsNotFound() throws Exception {
        Registered owner = TestUsers.register(mockMvc, objectMapper, "ATHLETE");
        Registered stranger = TestUsers.register(mockMvc, objectMapper, "ATHLETE");

        ObjectNode body = objectMapper.createObjectNode();
        body.put("title", "Programme prive " + System.nanoTime());
        body.put("description", "Description.");
        body.put("category", "STRENGTH");
        body.put("level", "BEGINNER");
        body.put("visibility", "PRIVATE");

        String response = mockMvc.perform(post("/api/programs")
                        .with(csrf())
                        .header("Authorization", "Bearer " + owner.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        String programId = node.get("id").asText();

        mockMvc.perform(get("/api/programs/" + programId)
                        .header("Authorization", "Bearer " + owner.token()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/programs/" + programId)
                        .header("Authorization", "Bearer " + stranger.token()))
                .andExpect(status().isNotFound());
    }
}

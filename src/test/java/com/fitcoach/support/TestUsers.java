package com.fitcoach.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.UUID;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/** Helper de creation d'utilisateurs de test via le vrai flux /api/auth/register. */
public final class TestUsers {

    private TestUsers() {}

    public record Registered(UUID id, String email, String token) {}

    public static Registered register(MockMvc mockMvc, ObjectMapper objectMapper, String role) throws Exception {
        String email = role.toLowerCase() + "." + UUID.randomUUID() + "@fitcoach.dev";
        ObjectNode body = objectMapper.createObjectNode();
        body.put("firstName", "Test");
        body.put("lastName", role);
        body.put("email", email);
        body.put("password", "Password1");
        body.put("role", role);

        String response = mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(response);
        String token = node.get("accessToken").asText();
        UUID id = UUID.fromString(node.get("user").get("id").asText());
        return new Registered(id, email, token);
    }
}

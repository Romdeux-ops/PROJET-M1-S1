package com.fitcoach;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * MockMvc ne rejoue pas le dispatch d'erreur du conteneur : un refus d'autorisation y donne bien 403.
 * Ce test passe par un vrai serveur HTTP pour verifier qu'un utilisateur authentifie mais sans le bon role
 * recoit 403 (et non 401), et qu'une requete sans jeton recoit 401.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class RealHttpAuthorizationStatusTests {

    @Value("${local.server.port}")
    private int port;

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void authenticatedUserWithoutTheRoleGets403AndAnonymousGets401() throws Exception {
        String athleteToken = registerAthlete();

        HttpResponse<String> wrongRole = send("POST", "/api/coaching/posts", athleteToken, "{\"content\":\"x\"}");
        HttpResponse<String> anonymous = send("GET", "/api/users/me", null, null);

        assertThat(wrongRole.statusCode()).isEqualTo(403);
        assertThat(anonymous.statusCode()).isEqualTo(401);
    }

    private String registerAthlete() throws Exception {
        String body = "{\"firstName\":\"Test\",\"lastName\":\"Http\",\"email\":\"athlete."
                + UUID.randomUUID()
                + "@fitcoach.dev\",\"password\":\"Password1\",\"role\":\"ATHLETE\"}";
        HttpResponse<String> response = send("POST", "/api/auth/register", null, body);
        assertThat(response.statusCode()).isIn(200, 201);
        JsonNode json = objectMapper.readTree(response.body());
        return json.get("accessToken").asText();
    }

    private HttpResponse<String> send(String method, String path, String token, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        HttpRequest.BodyPublisher publisher =
                body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body);
        builder.method(method, publisher);
        return http.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }
}

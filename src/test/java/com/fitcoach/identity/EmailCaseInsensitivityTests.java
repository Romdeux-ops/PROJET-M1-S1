package com.fitcoach.identity;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** L'adresse e-mail ne tient jamais compte de la casse ni des espaces autour. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmailCaseInsensitivityTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loginIgnoresCaseAndSurroundingSpaces() throws Exception {
        String email = "casse." + UUID.randomUUID() + "@fitcoach.dev";
        register(email).andExpect(status().isCreated());

        login("  " + email.toUpperCase(Locale.ROOT) + " ").andExpect(status().isOk());
    }

    @Test
    void mixedCaseRegistrationIsStoredLowercaseAndLoginWorks() throws Exception {
        String email = "Mixte." + UUID.randomUUID() + "@FitCoach.dev";
        register(email)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value(email.toLowerCase(Locale.ROOT)));

        login(email.toLowerCase(Locale.ROOT)).andExpect(status().isOk());
    }

    @Test
    void duplicateDifferingOnlyByCaseIsReportedAsExistingAccount() throws Exception {
        String email = "doublon." + UUID.randomUUID() + "@fitcoach.dev";
        register(email).andExpect(status().isCreated());

        register(email.toUpperCase(Locale.ROOT))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.startsWith("Un compte existe deja")));
    }

    @Test
    void invitationFindsAthleteWhateverTheCase() throws Exception {
        ApiClient client = new ApiClient(mockMvc);
        Registered coach = client.register("COACH");
        Registered athlete = client.register("ATHLETE");

        client.post(coach, "/api/coaching/athletes", Map.of("athleteEmail", athlete.email().toUpperCase(Locale.ROOT)))
                .andExpect(status().isCreated());
    }

    private ResultActions register(String email) throws Exception {
        Map<String, String> body = Map.of(
                "firstName", "Test",
                "lastName", "Casse",
                "email", email,
                "password", "Password1",
                "role", "ATHLETE");
        return mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private ResultActions login(String email) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", email, "password", "Password1"))));
    }
}

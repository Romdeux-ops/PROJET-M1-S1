package com.fitcoach.ai;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitcoach.support.TestUsers;
import com.fitcoach.support.TestUsers.Registered;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** strategy=claude force Claude : sans cle, 503 comme avant (pas de repli silencieux vers les regles). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {"fitcoach.ai.api-key=", "fitcoach.ai.strategy=claude"})
class ProgramGenerationClaudeStrategyTests {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void forcedClaudeWithoutKeyAnswers503() throws Exception {
        Registered athlete = TestUsers.register(mockMvc, objectMapper, "ATHLETE");

        mockMvc.perform(post("/api/ai/program-generation")
                        .with(csrf())
                        .header("Authorization", "Bearer " + athlete.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"goal\":\"MUSCLE_GAIN\",\"level\":\"BEGINNER\",\"sessionsPerWeek\":3}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.detail").value(containsString("non configuree")));
    }
}

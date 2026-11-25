package com.fitcoach.messaging;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

/** La limite de 2 000 caracteres porte sur le message stocke, espaces de bord retires. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MessageLengthTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered athlete;
    private String conversationId;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        Registered coach = client.register("COACH");
        athlete = client.register("ATHLETE");
        client.attachCoach(coach, athlete);
        conversationId = client.startConversation(athlete, coach);
    }

    @Test
    void surroundingSpacesDoNotCountTowardsTheLimit() throws Exception {
        String content = "a".repeat(1999);
        client.post(athlete, messages(), Map.of("body", "   " + content + "   "))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.body").value(content));
    }

    @Test
    void contentAboveTheLimitIsStillRejected() throws Exception {
        client.post(athlete, messages(), Map.of("body", "a".repeat(2001))).andExpect(status().isBadRequest());
    }

    @Test
    void onlySpacesIsRejected() throws Exception {
        client.post(athlete, messages(), Map.of("body", "     ")).andExpect(status().isBadRequest());
    }

    private String messages() {
        return "/api/messaging/conversations/" + conversationId + "/messages";
    }
}

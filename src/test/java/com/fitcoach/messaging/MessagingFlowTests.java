package com.fitcoach.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Ouverture de conversation, envoi, pagination, accuses de lecture et controle d'acces. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MessagingFlowTests {

    private static final String CONVERSATIONS = "/api/messaging/conversations";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private ApiClient api;
    private Registered coach;
    private Registered athlete;

    @BeforeEach
    void setUp() throws Exception {
        api = new ApiClient(mockMvc);
        coach = api.register("COACH");
        athlete = api.register("ATHLETE");
        api.attachCoach(coach, athlete);
    }

    private static String messagesOf(String conversationId) {
        return CONVERSATIONS + "/" + conversationId + "/messages";
    }

    private Map<String, Object> startBody(Registered counterpart) {
        return Map.of("counterpartId", counterpart.id().toString());
    }

    @Test
    void coachAndAthleteShareASingleConversation() throws Exception {
        JsonNode created = api.json(api.post(coach, CONVERSATIONS, startBody(athlete))
                .andExpect(status().isCreated()));
        assertThat(created.get("counterpartId").asText()).isEqualTo(athlete.id().toString());
        assertThat(created.get("counterpartName").asText()).isEqualTo("Test ATHLETE");
        assertThat(created.get("unreadCount").asLong()).isZero();

        api.post(coach, CONVERSATIONS, startBody(athlete))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.get("id").asText()));
        api.post(athlete, CONVERSATIONS, startBody(coach))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.get("id").asText()))
                .andExpect(jsonPath("$.counterpartId").value(coach.id().toString()));
    }

    @Test
    void sentMessagesAreUnreadForTheRecipientUntilMarkedRead() throws Exception {
        String conversationId = api.startConversation(athlete, coach);
        api.sendMessage(athlete, conversationId, "  Bonjour coach  ");
        api.sendMessage(athlete, conversationId, "Une question sur le programme");
        api.sendMessage(coach, conversationId, "Je t'ecoute");

        api.get(coach, CONVERSATIONS)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].unreadCount").value(2))
                .andExpect(jsonPath("$[0].lastMessagePreview").value("Je t'ecoute"))
                .andExpect(jsonPath("$[0].lastMessageSenderId").value(coach.id().toString()));
        api.get(athlete, CONVERSATIONS).andExpect(jsonPath("$[0].unreadCount").value(1));

        api.patch(coach, CONVERSATIONS + "/" + conversationId + "/read", Map.of())
                .andExpect(status().isNoContent());

        api.get(coach, CONVERSATIONS).andExpect(jsonPath("$[0].unreadCount").value(0));
        api.get(athlete, CONVERSATIONS).andExpect(jsonPath("$[0].unreadCount").value(1));
        api.get(athlete, messagesOf(conversationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].body").value("Je t'ecoute"))
                .andExpect(jsonPath("$.items[0].readAt").doesNotExist())
                .andExpect(jsonPath("$.items[2].body").value("Bonjour coach"))
                .andExpect(jsonPath("$.items[2].readAt").exists())
                .andExpect(jsonPath("$.nextCursor").doesNotExist());
    }

    @Test
    void historyIsPagedByCursorWithoutGapsNorDuplicates() throws Exception {
        String conversationId = api.startConversation(coach, athlete);
        List<String> sent = new ArrayList<>();
        for (int i = 0; i < 35; i++) {
            sent.add(api.sendMessage(i % 2 == 0 ? coach : athlete, conversationId, "Message " + i));
        }

        JsonNode first = api.json(api.get(coach, messagesOf(conversationId)).andExpect(status().isOk()));
        assertThat(first.get("items")).hasSize(30);
        String cursor = first.get("nextCursor").asText();

        JsonNode second = api.json(api.get(coach, messagesOf(conversationId) + "?before=" + cursor)
                .andExpect(status().isOk()));
        assertThat(second.get("items")).hasSize(5);
        assertThat(second.get("nextCursor").isNull()).isTrue();

        List<String> received = new ArrayList<>();
        first.get("items").forEach(m -> received.add(m.get("id").asText()));
        second.get("items").forEach(m -> received.add(m.get("id").asText()));
        assertThat(received).containsExactlyElementsOf(sent.reversed());
    }

    @Test
    void pageSizeIsBounded() throws Exception {
        String conversationId = api.startConversation(coach, athlete);

        api.get(coach, messagesOf(conversationId) + "?size=0").andExpect(status().isBadRequest());
        api.get(coach, messagesOf(conversationId) + "?size=101").andExpect(status().isBadRequest());
        api.get(coach, messagesOf(conversationId) + "?size=100").andExpect(status().isOk());
    }

    @Test
    void aCursorFromAnotherConversationIsRejected() throws Exception {
        Registered otherAthlete = api.register("ATHLETE");
        api.attachCoach(coach, otherAthlete);
        String conversationId = api.startConversation(coach, athlete);
        String otherConversationId = api.startConversation(coach, otherAthlete);
        String foreignMessageId = api.sendMessage(coach, otherConversationId, "Ailleurs");

        api.get(coach, messagesOf(conversationId) + "?before=" + foreignMessageId)
                .andExpect(status().isBadRequest());
    }

    @Test
    void emptyOrTooLongMessagesAreRejected() throws Exception {
        String conversationId = api.startConversation(coach, athlete);

        api.post(coach, messagesOf(conversationId), Map.of("body", "   ")).andExpect(status().isBadRequest());
        api.post(coach, messagesOf(conversationId), Map.of("body", "x".repeat(2001)))
                .andExpect(status().isBadRequest());
        api.post(coach, messagesOf(conversationId), Map.of("body", "x".repeat(2000)))
                .andExpect(status().isCreated());
    }

    @Test
    void someoneOutsideTheConversationCannotSeeNorUseIt() throws Exception {
        Registered stranger = api.register("COACH");
        String conversationId = api.startConversation(coach, athlete);
        api.sendMessage(coach, conversationId, "Prive");

        api.get(stranger, CONVERSATIONS).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        api.get(stranger, messagesOf(conversationId)).andExpect(status().isNotFound());
        api.post(stranger, messagesOf(conversationId), Map.of("body", "Intrus")).andExpect(status().isNotFound());
        api.patch(stranger, CONVERSATIONS + "/" + conversationId + "/read", Map.of())
                .andExpect(status().isNotFound());
    }

    @Test
    void aConversationRequiresAnActiveRelation() throws Exception {
        Registered stranger = api.register("ATHLETE");

        api.post(coach, CONVERSATIONS, startBody(stranger)).andExpect(status().isForbidden());
        api.post(stranger, CONVERSATIONS, startBody(coach)).andExpect(status().isForbidden());
        api.post(coach, CONVERSATIONS, startBody(coach)).andExpect(status().isForbidden());
    }

    @Test
    void anEndedRelationKeepsTheHistoryReadableButBlocksNewMessages() throws Exception {
        String conversationId = api.startConversation(athlete, coach);
        api.sendMessage(athlete, conversationId, "Merci pour tout");
        jdbc.update(
                "UPDATE coach_athlete SET status = 'ENDED' WHERE coach_id = ? AND athlete_id = ?",
                coach.id(), athlete.id());

        api.get(coach, messagesOf(conversationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));
        api.patch(coach, CONVERSATIONS + "/" + conversationId + "/read", Map.of())
                .andExpect(status().isNoContent());
        api.post(coach, messagesOf(conversationId), Map.of("body", "Reviens vite"))
                .andExpect(status().isForbidden());
        api.post(athlete, CONVERSATIONS, startBody(coach)).andExpect(status().isForbidden());
    }

    @Test
    void concurrentOpeningsCreateASingleConversation() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        Callable<String> fromCoach = () -> {
            start.await();
            return api.json(api.post(coach, CONVERSATIONS, startBody(athlete))).get("id").asText();
        };
        Callable<String> fromAthlete = () -> {
            start.await();
            return api.json(api.post(athlete, CONVERSATIONS, startBody(coach))).get("id").asText();
        };

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Future<String>> results = List.of(executor.submit(fromCoach), executor.submit(fromAthlete));
            start.countDown();
            Set<String> ids = new HashSet<>(List.of(results.get(0).get(), results.get(1).get()));
            assertThat(ids).hasSize(1);
        } finally {
            executor.shutdownNow();
        }
    }
}

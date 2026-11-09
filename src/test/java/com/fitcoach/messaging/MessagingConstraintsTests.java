package com.fitcoach.messaging;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Les invariants de la messagerie tiennent en base, sans passer par le service. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MessagingConstraintsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private Registered coach;
    private Registered athlete;

    @BeforeEach
    void setUp() throws Exception {
        ApiClient api = new ApiClient(mockMvc);
        coach = api.register("COACH");
        athlete = api.register("ATHLETE");
    }

    private UUID insertConversation(UUID coachId, UUID athleteId) {
        return jdbc.queryForObject(
                "INSERT INTO conversations (coach_id, athlete_id) VALUES (?, ?) RETURNING id",
                UUID.class, coachId, athleteId);
    }

    private void insertMessage(UUID conversationId, UUID senderId, String body) {
        jdbc.update(
                "INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)",
                conversationId, senderId, body);
    }

    @Test
    void aPairHasASingleConversation() {
        insertConversation(coach.id(), athlete.id());

        assertThatThrownBy(() -> insertConversation(coach.id(), athlete.id()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void nobodyTalksToThemselves() {
        assertThatThrownBy(() -> insertConversation(coach.id(), coach.id()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void aMessageHoldsBetween1And2000Characters() {
        UUID conversationId = insertConversation(coach.id(), athlete.id());
        insertMessage(conversationId, coach.id(), "x".repeat(2000));

        assertThatThrownBy(() -> insertMessage(conversationId, coach.id(), ""))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertMessage(conversationId, coach.id(), "x".repeat(2001)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void aMessageCannotBeReadBeforeBeingSent() {
        UUID conversationId = insertConversation(coach.id(), athlete.id());

        assertThatThrownBy(() -> jdbc.update(
                        "INSERT INTO messages (conversation_id, sender_id, body, created_at, read_at)"
                                + " VALUES (?, ?, 'x', now(), now() - interval '1 second')",
                        conversationId, coach.id()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}

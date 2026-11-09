package com.fitcoach.messaging.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Conversation entre un coach et un athlete (table {@code conversations}, V10).
 *
 * <p>Unique par paire et creee a la demande. {@code lastMessageAt} n'est avance
 * que par une mise a jour atomique du depot, jamais par cette entite : deux
 * envois concurrents ne peuvent pas ainsi se l'ecraser.
 */
@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "coach_id", nullable = false, updatable = false)
    private UUID coachId;

    @Column(name = "athlete_id", nullable = false, updatable = false)
    private UUID athleteId;

    @Column(name = "last_message_at", insertable = false, updatable = false)
    private Instant lastMessageAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected Conversation() {
        // JPA
    }

    public UUID getId() {
        return id;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public UUID getAthleteId() {
        return athleteId;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean involves(UUID userId) {
        return coachId.equals(userId) || athleteId.equals(userId);
    }

    public UUID counterpartOf(UUID userId) {
        return coachId.equals(userId) ? athleteId : coachId;
    }
}

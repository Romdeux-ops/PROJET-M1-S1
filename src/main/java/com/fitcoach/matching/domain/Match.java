package com.fitcoach.matching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Match entre un coach et un athlete (table {@code matches}, V19). Cree par une
 * insertion idempotente du depot ; cette entite ne sert qu'a le lire et a le
 * terminer.
 */
@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "coach_id", nullable = false, updatable = false)
    private UUID coachId;

    @Column(name = "athlete_id", nullable = false, updatable = false)
    private UUID athleteId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    protected Match() {
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

    public MatchStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public boolean involves(UUID userId) {
        return coachId.equals(userId) || athleteId.equals(userId);
    }

    public UUID counterpartOf(UUID userId) {
        return coachId.equals(userId) ? athleteId : coachId;
    }

    /** Sans effet sur un match deja termine. */
    public void end(Instant at) {
        if (status == MatchStatus.ACTIVE) {
            status = MatchStatus.ENDED;
            endedAt = at;
        }
    }
}

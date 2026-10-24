package com.fitcoach.coaching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Relation coach-athlete (table {@code coach_athlete}, V3).
 *
 * <p>Version minimale anticipee sur la phase 8 : pas de flux d'invitation,
 * une relation nait directement ACTIVE. Sert pour l'instant uniquement a
 * restreindre la visibilite des publications d'un coach a ses clients.
 */
@Entity
@Table(name = "coach_athlete")
@IdClass(CoachAthleteId.class)
public class CoachAthlete {

    @Id
    @Column(name = "coach_id")
    private UUID coachId;

    @Id
    @Column(name = "athlete_id")
    private UUID athleteId;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected CoachAthlete() {
        // JPA
    }

    public CoachAthlete(UUID coachId, UUID athleteId) {
        this.coachId = coachId;
        this.athleteId = athleteId;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public UUID getAthleteId() {
        return athleteId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }
}

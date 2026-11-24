package com.fitcoach.coaching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Relation coach-athlete (table {@code coach_athlete}, V3 puis V13).
 *
 * <p>Nait PENDING sur invitation du coach ; l'athlete l'accepte ou la refuse.
 * Les transitions sont portees par le domaine : un appelant ne peut pas
 * produire un etat que le cycle de vie interdit.
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CoachAthleteStatus status = CoachAthleteStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "invited_at", nullable = false)
    private Instant invitedAt = Instant.now();

    @Column(name = "responded_at")
    private Instant respondedAt;

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

    public CoachAthleteStatus getStatus() {
        return status;
    }

    public Instant getInvitedAt() {
        return invitedAt;
    }

    public boolean isActive() {
        return status == CoachAthleteStatus.ACTIVE;
    }

    public boolean isPending() {
        return status == CoachAthleteStatus.PENDING;
    }

    public boolean isRequested() {
        return status == CoachAthleteStatus.REQUESTED;
    }

    /** Relation creee par une demande de l'athlete (profil public du coach). */
    public static CoachAthlete requestedBy(UUID coachId, UUID athleteId) {
        CoachAthlete relation = new CoachAthlete(coachId, athleteId);
        relation.status = CoachAthleteStatus.REQUESTED;
        return relation;
    }

    /** Nouvelle demande de l'athlete (depuis DECLINED ou ENDED). */
    public void request() {
        status = CoachAthleteStatus.REQUESTED;
        invitedAt = Instant.now();
        respondedAt = null;
    }

    /** Relance une invitation (depuis DECLINED ou ENDED) ; une relation PENDING ou ACTIVE se suffit. */
    public void invite() {
        status = CoachAthleteStatus.PENDING;
        invitedAt = Instant.now();
        respondedAt = null;
    }

    public void accept() {
        respond(CoachAthleteStatus.ACTIVE);
    }

    public void decline() {
        respond(CoachAthleteStatus.DECLINED);
    }

    public void end() {
        respond(CoachAthleteStatus.ENDED);
    }

    private void respond(CoachAthleteStatus outcome) {
        status = outcome;
        respondedAt = Instant.now();
    }
}

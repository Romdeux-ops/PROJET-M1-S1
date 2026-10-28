package com.fitcoach.planning.domain;

import com.fitcoach.planning.exception.InvalidScheduledSessionStatusException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Seance planifiee dans le calendrier (table {@code scheduled_sessions}, V8).
 */
@Entity
@Table(name = "scheduled_sessions")
public class ScheduledSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "athlete_id", nullable = false)
    private UUID athleteId;

    @Column(name = "program_id")
    private UUID programId;

    @Column(name = "program_day_id")
    private UUID programDayId;

    @Column(name = "workout_session_id")
    private UUID workoutSessionId;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduledSessionStatus status = ScheduledSessionStatus.PLANNED;

    @Column(nullable = false)
    private String title;

    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected ScheduledSession() {
        // JPA
    }

    public ScheduledSession(UUID athleteId, String title, LocalDate scheduledDate) {
        this.athleteId = athleteId;
        this.title = title;
        this.scheduledDate = scheduledDate;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAthleteId() {
        return athleteId;
    }

    public UUID getProgramId() {
        return programId;
    }

    public void setProgramId(UUID programId) {
        this.programId = programId;
    }

    public UUID getProgramDayId() {
        return programDayId;
    }

    public void setProgramDayId(UUID programDayId) {
        this.programDayId = programDayId;
    }

    public UUID getWorkoutSessionId() {
        return workoutSessionId;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public ScheduledSessionStatus getStatus() {
        return status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isOwnedBy(UUID userId) {
        return athleteId.equals(userId);
    }

    /** Une seance sautee redevient planifiee ; une seance realisee ne se deplace plus. */
    public void reschedule(LocalDate newDate) {
        if (status != ScheduledSessionStatus.PLANNED) {
            transitionTo(ScheduledSessionStatus.PLANNED);
        }
        this.scheduledDate = newDate;
    }

    public void skip() {
        transitionTo(ScheduledSessionStatus.SKIPPED);
    }

    /** @param needsCoachValidation vrai si l'athlete a un coach actif, qui devra valider */
    public void complete(UUID workoutSessionId, boolean needsCoachValidation) {
        transitionTo(needsCoachValidation ? ScheduledSessionStatus.PENDING_VALIDATION : ScheduledSessionStatus.DONE);
        this.workoutSessionId = workoutSessionId;
    }

    public void validate() {
        if (status != ScheduledSessionStatus.PENDING_VALIDATION) {
            throw new InvalidScheduledSessionStatusException(status, ScheduledSessionStatus.DONE);
        }
        transitionTo(ScheduledSessionStatus.DONE);
    }

    private void transitionTo(ScheduledSessionStatus target) {
        if (!status.canTransitionTo(target)) {
            throw new InvalidScheduledSessionStatusException(status, target);
        }
        this.status = target;
    }
}

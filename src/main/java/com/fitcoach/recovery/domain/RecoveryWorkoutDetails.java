package com.fitcoach.recovery.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recovery_workout_details")
public class RecoveryWorkoutDetails {

    @Id
    @Column(name = "workout_session_id", nullable = false)
    private UUID workoutSessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", columnDefinition = "text")
    private ActivityType activityType;

    @Column(name = "session_rpe", precision = 3, scale = 1)
    private BigDecimal sessionRpe;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RecoveryWorkoutDetails() {
    }

    public RecoveryWorkoutDetails(
            UUID workoutSessionId,
            ActivityType activityType,
            BigDecimal sessionRpe
    ) {
        this.workoutSessionId = workoutSessionId;
        this.activityType = activityType;
        this.sessionRpe = sessionRpe;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getWorkoutSessionId() {
        return workoutSessionId;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public BigDecimal getSessionRpe() {
        return sessionRpe;
    }

    public void setSessionRpe(BigDecimal sessionRpe) {
        this.sessionRpe = sessionRpe;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
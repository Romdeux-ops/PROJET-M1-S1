package com.fitcoach.training.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.Generated;

@Entity
@Table(name = "session_sets")
public class SessionSet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "exercise_id", nullable = false)
    private UUID exerciseId;

    @Column(nullable = false)
    private int position;

    @Column(name = "set_number", nullable = false)
    private int setNumber;

    @Column(nullable = false)
    private int reps;

    @Column(name = "weight_kg", nullable = false)
    private BigDecimal weightKg;

    private BigDecimal rpe;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @Generated
    @Column(name = "estimated_1rm", insertable = false, updatable = false)
    private BigDecimal estimated1Rm;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected SessionSet() {
        // JPA
    }

    public SessionSet(UUID sessionId, UUID exerciseId, int position, int setNumber, int reps, BigDecimal weightKg) {
        this.sessionId = sessionId;
        this.exerciseId = exerciseId;
        this.position = position;
        this.setNumber = setNumber;
        this.reps = reps;
        this.weightKg = weightKg;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public UUID getExerciseId() {
        return exerciseId;
    }

    public int getPosition() {
        return position;
    }

    public int getSetNumber() {
        return setNumber;
    }

    public int getReps() {
        return reps;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public BigDecimal getRpe() {
        return rpe;
    }

    public void setRpe(BigDecimal rpe) {
        this.rpe = rpe;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public void setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public BigDecimal volume() {
        return weightKg.multiply(BigDecimal.valueOf(reps));
    }

    /** Calcule par PostgreSQL (colonne generee) ; disponible apres flush. */
    public BigDecimal getEstimated1Rm() {
        return estimated1Rm;
    }
}

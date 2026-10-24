package com.fitcoach.training.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "personal_records")
@IdClass(PersonalRecordId.class)
public class PersonalRecord {

    @Id
    @Column(name = "athlete_id")
    private UUID athleteId;

    @Id
    @Column(name = "exercise_id")
    private UUID exerciseId;

    @Id
    @Enumerated(EnumType.STRING)
    private PersonalRecordMetric metric;

    @Column(nullable = false)
    private BigDecimal value;

    @Column(name = "session_set_id", nullable = false)
    private UUID sessionSetId;

    @Column(name = "achieved_at", nullable = false)
    private Instant achievedAt;

    protected PersonalRecord() {
        // JPA
    }

    public PersonalRecord(
            UUID athleteId, UUID exerciseId, PersonalRecordMetric metric, BigDecimal value, UUID sessionSetId, Instant achievedAt) {
        this.athleteId = athleteId;
        this.exerciseId = exerciseId;
        this.metric = metric;
        this.value = value;
        this.sessionSetId = sessionSetId;
        this.achievedAt = achievedAt;
    }

    public UUID getAthleteId() {
        return athleteId;
    }

    public UUID getExerciseId() {
        return exerciseId;
    }

    public PersonalRecordMetric getMetric() {
        return metric;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public UUID getSessionSetId() {
        return sessionSetId;
    }

    public void setSessionSetId(UUID sessionSetId) {
        this.sessionSetId = sessionSetId;
    }

    public Instant getAchievedAt() {
        return achievedAt;
    }

    public void setAchievedAt(Instant achievedAt) {
        this.achievedAt = achievedAt;
    }
}

package com.fitcoach.training.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.Immutable;

/**
 * Lecture seule : les records sont une projection des series, ecrite uniquement
 * par {@code PersonalRecordService} en SQL.
 */
@Entity
@Immutable
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

    protected PersonalRecord() {
        // JPA
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

    public UUID getSessionSetId() {
        return sessionSetId;
    }
}

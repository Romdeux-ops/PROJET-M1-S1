package com.fitcoach.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "exercise_alternatives")
@IdClass(ExerciseAlternativeId.class)
public class ExerciseAlternative {

    @Id
    @Column(name = "exercise_id")
    private UUID exerciseId;

    @Id
    @Column(name = "alternative_exercise_id")
    private UUID alternativeExerciseId;

    protected ExerciseAlternative() {
        // JPA
    }

    public ExerciseAlternative(UUID exerciseId, UUID alternativeExerciseId) {
        this.exerciseId = exerciseId;
        this.alternativeExerciseId = alternativeExerciseId;
    }

    public UUID getExerciseId() {
        return exerciseId;
    }

    public UUID getAlternativeExerciseId() {
        return alternativeExerciseId;
    }
}

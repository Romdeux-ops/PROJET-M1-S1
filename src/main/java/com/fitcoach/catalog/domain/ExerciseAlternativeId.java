package com.fitcoach.catalog.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ExerciseAlternativeId implements Serializable {

    private UUID exerciseId;
    private UUID alternativeExerciseId;

    public ExerciseAlternativeId() {}

    public ExerciseAlternativeId(UUID exerciseId, UUID alternativeExerciseId) {
        this.exerciseId = exerciseId;
        this.alternativeExerciseId = alternativeExerciseId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExerciseAlternativeId that)) return false;
        return Objects.equals(exerciseId, that.exerciseId)
                && Objects.equals(alternativeExerciseId, that.alternativeExerciseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(exerciseId, alternativeExerciseId);
    }
}

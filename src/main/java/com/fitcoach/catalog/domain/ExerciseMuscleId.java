package com.fitcoach.catalog.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ExerciseMuscleId implements Serializable {

    private UUID exerciseId;
    private UUID muscleGroupId;

    public ExerciseMuscleId() {}

    public ExerciseMuscleId(UUID exerciseId, UUID muscleGroupId) {
        this.exerciseId = exerciseId;
        this.muscleGroupId = muscleGroupId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExerciseMuscleId that)) return false;
        return Objects.equals(exerciseId, that.exerciseId) && Objects.equals(muscleGroupId, that.muscleGroupId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(exerciseId, muscleGroupId);
    }
}

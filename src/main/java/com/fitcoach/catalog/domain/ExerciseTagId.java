package com.fitcoach.catalog.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ExerciseTagId implements Serializable {

    private UUID exerciseId;
    private UUID tagId;

    public ExerciseTagId() {}

    public ExerciseTagId(UUID exerciseId, UUID tagId) {
        this.exerciseId = exerciseId;
        this.tagId = tagId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExerciseTagId that)) return false;
        return Objects.equals(exerciseId, that.exerciseId) && Objects.equals(tagId, that.tagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(exerciseId, tagId);
    }
}

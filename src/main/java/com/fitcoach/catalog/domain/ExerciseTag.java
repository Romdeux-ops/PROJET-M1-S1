package com.fitcoach.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "exercise_tags")
@IdClass(ExerciseTagId.class)
public class ExerciseTag {

    @Id
    @Column(name = "exercise_id")
    private UUID exerciseId;

    @Id
    @Column(name = "tag_id")
    private UUID tagId;

    protected ExerciseTag() {
        // JPA
    }

    public ExerciseTag(UUID exerciseId, UUID tagId) {
        this.exerciseId = exerciseId;
        this.tagId = tagId;
    }

    public UUID getExerciseId() {
        return exerciseId;
    }

    public UUID getTagId() {
        return tagId;
    }
}

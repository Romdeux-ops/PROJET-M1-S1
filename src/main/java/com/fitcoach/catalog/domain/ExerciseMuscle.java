package com.fitcoach.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "exercise_muscles")
@IdClass(ExerciseMuscleId.class)
public class ExerciseMuscle {

    @Id
    @Column(name = "exercise_id")
    private UUID exerciseId;

    @Id
    @Column(name = "muscle_group_id")
    private UUID muscleGroupId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MuscleRole role;

    protected ExerciseMuscle() {
        // JPA
    }

    public ExerciseMuscle(UUID exerciseId, UUID muscleGroupId, MuscleRole role) {
        this.exerciseId = exerciseId;
        this.muscleGroupId = muscleGroupId;
        this.role = role;
    }

    public UUID getExerciseId() {
        return exerciseId;
    }

    public UUID getMuscleGroupId() {
        return muscleGroupId;
    }

    public MuscleRole getRole() {
        return role;
    }
}

package com.fitcoach.program.domain;

import com.fitcoach.common.domain.Positioned;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "program_exercises")
public class ProgramExercise implements Positioned {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "program_day_id", nullable = false)
    private UUID programDayId;

    @Column(name = "exercise_id", nullable = false)
    private UUID exerciseId;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private int sets;

    @Column(nullable = false)
    private String reps;

    @Column(name = "rest_seconds", nullable = false)
    private int restSeconds = 90;

    private String notes;

    protected ProgramExercise() {
        // JPA
    }

    public ProgramExercise(UUID programDayId, UUID exerciseId, int position, int sets, String reps) {
        this.programDayId = programDayId;
        this.exerciseId = exerciseId;
        this.position = position;
        this.sets = sets;
        this.reps = reps;
    }

    @Override
    public UUID getId() {
        return id;
    }

    public UUID getProgramDayId() {
        return programDayId;
    }

    public UUID getExerciseId() {
        return exerciseId;
    }

    public int getPosition() {
        return position;
    }

    @Override
    public void setPosition(int position) {
        this.position = position;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public String getReps() {
        return reps;
    }

    public void setReps(String reps) {
        this.reps = reps;
    }

    public int getRestSeconds() {
        return restSeconds;
    }

    public void setRestSeconds(int restSeconds) {
        this.restSeconds = restSeconds;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

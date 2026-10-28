package com.fitcoach.program.dto;

import com.fitcoach.program.domain.ProgramExercise;
import java.util.UUID;

public record ProgramExerciseResponse(
        UUID id,
        UUID exerciseId,
        String exerciseName,
        int position,
        int sets,
        String reps,
        int restSeconds,
        String notes) {

    public static ProgramExerciseResponse from(ProgramExercise exercise, String exerciseName) {
        return new ProgramExerciseResponse(
                exercise.getId(),
                exercise.getExerciseId(),
                exerciseName,
                exercise.getPosition(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getRestSeconds(),
                exercise.getNotes());
    }
}

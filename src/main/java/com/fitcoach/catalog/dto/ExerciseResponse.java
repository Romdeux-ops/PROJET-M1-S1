package com.fitcoach.catalog.dto;

import com.fitcoach.catalog.domain.Exercise;
import com.fitcoach.catalog.domain.ExerciseDifficulty;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ExerciseResponse(
        UUID id,
        String slug,
        String name,
        String description,
        String equipment,
        ExerciseDifficulty difficulty,
        int defaultRestSeconds,
        String mediaUrl,
        List<ExerciseMuscleResponse> muscles,
        List<TagResponse> tags,
        List<UUID> alternativeExerciseIds,
        Instant createdAt,
        Instant updatedAt) {

    public static ExerciseResponse from(
            Exercise exercise,
            List<ExerciseMuscleResponse> muscles,
            List<TagResponse> tags,
            List<UUID> alternativeExerciseIds) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getSlug(),
                exercise.getName(),
                exercise.getDescription(),
                exercise.getEquipment(),
                exercise.getDifficulty(),
                exercise.getDefaultRestSeconds(),
                exercise.getMediaUrl(),
                muscles,
                tags,
                alternativeExerciseIds,
                exercise.getCreatedAt(),
                exercise.getUpdatedAt());
    }
}

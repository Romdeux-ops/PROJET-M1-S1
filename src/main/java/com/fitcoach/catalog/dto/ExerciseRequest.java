package com.fitcoach.catalog.dto;

import com.fitcoach.catalog.domain.ExerciseDifficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record ExerciseRequest(
        @NotBlank @Size(min = 2, max = 150) String name,
        @Size(max = 5000) String description,
        String equipment,
        @NotNull ExerciseDifficulty difficulty,
        @Min(0) @Max(1200) int defaultRestSeconds,
        String mediaUrl,
        @Valid List<ExerciseMuscleInput> muscles,
        List<UUID> tagIds,
        List<UUID> alternativeExerciseIds) {}

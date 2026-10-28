package com.fitcoach.program.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ProgramExerciseRequest(
        @NotNull UUID exerciseId,
        @Min(1) @Max(20) int sets,
        @NotBlank @Size(max = 20) String reps,
        @Min(0) @Max(1200) int restSeconds,
        @Size(max = 1000) String notes) {}

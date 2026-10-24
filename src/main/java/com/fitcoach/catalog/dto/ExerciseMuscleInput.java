package com.fitcoach.catalog.dto;

import com.fitcoach.catalog.domain.MuscleRole;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ExerciseMuscleInput(@NotNull UUID muscleGroupId, @NotNull MuscleRole role) {}

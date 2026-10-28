package com.fitcoach.catalog.dto;

import com.fitcoach.catalog.domain.MuscleRole;
import java.util.UUID;

public record ExerciseMuscleResponse(UUID muscleGroupId, String muscleGroupCode, String muscleGroupName, MuscleRole role) {}

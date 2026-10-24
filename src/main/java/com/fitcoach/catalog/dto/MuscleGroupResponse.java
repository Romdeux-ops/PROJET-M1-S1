package com.fitcoach.catalog.dto;

import com.fitcoach.catalog.domain.MuscleGroup;
import java.util.UUID;

public record MuscleGroupResponse(UUID id, String code, String name) {
    public static MuscleGroupResponse from(MuscleGroup muscleGroup) {
        return new MuscleGroupResponse(muscleGroup.getId(), muscleGroup.getCode(), muscleGroup.getName());
    }
}

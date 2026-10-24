package com.fitcoach.training.dto;

import com.fitcoach.training.domain.SessionSet;
import java.math.BigDecimal;
import java.util.UUID;

public record SessionSetResponse(
        UUID id,
        UUID exerciseId,
        String exerciseName,
        int position,
        int setNumber,
        int reps,
        BigDecimal weightKg,
        BigDecimal rpe,
        Integer restSeconds,
        BigDecimal volume,
        boolean isPersonalRecord) {

    public static SessionSetResponse from(SessionSet set, String exerciseName, boolean isPersonalRecord) {
        return new SessionSetResponse(
                set.getId(),
                set.getExerciseId(),
                exerciseName,
                set.getPosition(),
                set.getSetNumber(),
                set.getReps(),
                set.getWeightKg(),
                set.getRpe(),
                set.getRestSeconds(),
                set.volume(),
                isPersonalRecord);
    }
}

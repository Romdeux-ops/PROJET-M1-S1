package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.ActivityType;
import com.fitcoach.recovery.domain.RecoveryDataStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record RecoveryWorkoutResponse(

        UUID workoutSessionId,

        String title,

        Instant performedAt,

        Integer durationMinutes,

        ActivityType activityType,

        BigDecimal sessionRpe,

        BigDecimal averageSetRpe,

        BigDecimal effectiveRpe,

        String rpeSource,

        int totalSets,

        int setsWithRpe,

        BigDecimal weightKg,

        LocalDate weightMeasuredOn,

        BigDecimal met,

        String intensity,

        BigDecimal totalCaloriesKcal,

        BigDecimal activeCaloriesKcal,

        BigDecimal trainingLoad,

        RecoveryDataStatus dataStatus,

        List<String> missingData

) {

    public RecoveryWorkoutResponse {
        missingData = List.copyOf(missingData);
    }
}
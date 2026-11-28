package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.RecoveryDataStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecoveryTrainingSummaryResponse(

        LocalDate date,

        int totalSessions,

        int sessionsWithDuration,

        int sessionsWithTrainingLoad,

        int sessionsWithCalories,

        int sessionsWithEstimatedRpe,

        long recordedDurationMinutes,

        BigDecimal trainingLoad,

        BigDecimal activeCaloriesKcal,

        BigDecimal knownTrainingLoad,

        BigDecimal knownActiveCaloriesKcal,

        RecoveryDataStatus dataStatus,

        List<RecoveryWorkoutResponse> workouts

) {

    public RecoveryTrainingSummaryResponse {
        workouts = List.copyOf(workouts);
    }

    public boolean hasCompleteTrainingLoad() {
        return totalSessions == sessionsWithTrainingLoad;
    }

    public boolean hasCompleteCalories() {
        return totalSessions == sessionsWithCalories;
    }
}
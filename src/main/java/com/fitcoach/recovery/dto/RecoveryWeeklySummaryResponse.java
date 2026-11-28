package com.fitcoach.recovery.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecoveryWeeklySummaryResponse(

        LocalDate weekStart,
        LocalDate weekEnd,
        LocalDate evaluatedThrough,

        int elapsedDays,

        // Activite sportive
        int workoutCount,
        int trainingDays,
        int daysWithoutRecordedTraining,

        long recordedDurationMinutes,

        BigDecimal totalTrainingLoad,
        BigDecimal totalActiveCaloriesKcal,

        BigDecimal knownTrainingLoad,
        BigDecimal knownActiveCaloriesKcal,

        int sessionsWithDuration,
        int sessionsWithTrainingLoad,
        int sessionsWithCalories,
        int sessionsWithEstimatedRpe,

        boolean durationComplete,
        boolean trainingLoadComplete,
        boolean caloriesComplete,

        // Sommeil
        int sleepLogsCount,
        int approximateSleepLogsCount,
        BigDecimal averageSleepMinutes,
        BigDecimal averageSleepQuality,

        // Scores
        BigDecimal averageSleepScore,
        BigDecimal averageBodyBattery,
        BigDecimal averageTrainingReadiness,

        int daysWithSleepScore,
        int daysWithBodyBattery,
        int daysWithTrainingReadiness,

        // Questionnaire
        int checkinsCount,
        BigDecimal averageEnergyLevel,
        BigDecimal averageFatigueLevel,
        BigDecimal averageStressLevel,
        BigDecimal averageMuscleSoreness,

        // Planning
        RecoveryPlanningSummaryResponse planning

) {}
package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.RecoveryDataStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecoveryDailyTrendResponse(

        LocalDate date,

        // Scores de recuperation
        Integer sleepScore,
        Integer bodyBattery,
        Integer trainingReadiness,

        // Sommeil
        Long estimatedSleepMinutes,
        Integer sleepQuality,
        Boolean sleepDurationApproximate,

        // Questionnaire
        Integer energyLevel,
        Integer fatigueLevel,
        Integer stressLevel,
        Integer muscleSoreness,

        // Activite sportive
        int workoutCount,
        long recordedDurationMinutes,
        BigDecimal trainingLoad,
        BigDecimal activeCaloriesKcal,

        // Qualite des donnees
        RecoveryDataStatus dataStatus

) {}
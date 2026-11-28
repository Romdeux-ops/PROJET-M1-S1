package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.RecoveryAssessment;
import com.fitcoach.recovery.domain.RecoveryDataStatus;
import com.fitcoach.recovery.domain.RecoveryRecommendation;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public record RecoveryAssessmentResponse(

        UUID id,
        LocalDate assessmentDate,

        // Scores principaux

        Integer sleepScore,
        Integer bodyBattery,
        Integer trainingReadiness,

        // Activite sportive

        BigDecimal trainingLoad,
        BigDecimal recentTrainingLoad,
        BigDecimal activeCaloriesKcal,

        // Decomposition du Body Battery

        BigDecimal previousBodyBattery,
        BigDecimal sleepRecharge,
        BigDecimal trainingDrain,
        BigDecimal stressDrain,
        BigDecimal dailyDrain,

        // Informations de calcul

        RecoveryDataStatus dataStatus,
        RecoveryRecommendation recommendation,

        Map<String, Object> calculationDetails,

        String algorithmVersion,
        Instant calculatedAt

) {

    public static RecoveryAssessmentResponse from(
            RecoveryAssessment assessment
    ) {
        return new RecoveryAssessmentResponse(
                assessment.getId(),
                assessment.getAssessmentDate(),

                assessment.getSleepScore(),
                assessment.getBodyBattery(),
                assessment.getTrainingReadiness(),

                assessment.getTrainingLoad(),
                assessment.getRecentTrainingLoad(),
                assessment.getActiveCaloriesKcal(),

                assessment.getPreviousBodyBattery(),
                assessment.getSleepRecharge(),
                assessment.getTrainingDrain(),
                assessment.getStressDrain(),
                assessment.getDailyDrain(),

                assessment.getDataStatus(),
                assessment.getRecommendation(),

                Collections.unmodifiableMap(
                        new LinkedHashMap<>(
                                assessment.getCalculationDetails()
                        )
                ),

                assessment.getAlgorithmVersion(),
                assessment.getCalculatedAt()
        );
    }
}
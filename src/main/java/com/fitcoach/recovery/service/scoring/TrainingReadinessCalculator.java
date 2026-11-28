package com.fitcoach.recovery.service.scoring;

import com.fitcoach.recovery.domain.RecoveryRecommendation;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Estimation de la preparation a l'entrainement.
 */
public final class TrainingReadinessCalculator {

    private static final double BATTERY_WEIGHT = 0.30;
    private static final double SLEEP_WEIGHT = 0.15;
    private static final double LOAD_WEIGHT = 0.25;
    private static final double SORENESS_WEIGHT = 0.20;
    private static final double REST_WEIGHT = 0.10;

    private static final double FULL_REST_HOURS = 48.0;

    private TrainingReadinessCalculator() {
    }

    public static Optional<Result> calculate(
            Integer bodyBattery,
            Integer sleepScore,
            BigDecimal recentTrainingLoad,
            Integer muscleSoreness,
            Double hoursSinceLastWorkout
    ) {

        if (!isValidScore(bodyBattery) ||
                !isValidScore(sleepScore) ||
                recentTrainingLoad == null ||
                recentTrainingLoad.signum() < 0 ||
                muscleSoreness == null ||
                muscleSoreness < 0 ||
                muscleSoreness > 10) {

            return Optional.empty();
        }

        if (hoursSinceLastWorkout != null &&
                (!Double.isFinite(hoursSinceLastWorkout) ||
                 hoursSinceLastWorkout < 0)) {

            return Optional.empty();
        }

        double loadScore = clamp(
                100.0 -
                recentTrainingLoad.doubleValue() / 10.0
        );

        double sorenessScore = clamp(
                100.0 - muscleSoreness * 10.0
        );

        Double restScore =
                hoursSinceLastWorkout == null
                        ? null
                        : clamp(
                                100.0 *
                                hoursSinceLastWorkout
                                / FULL_REST_HOURS
                        );

        double weightedScore =
                BATTERY_WEIGHT * bodyBattery
                + SLEEP_WEIGHT * sleepScore
                + LOAD_WEIGHT * loadScore
                + SORENESS_WEIGHT * sorenessScore;

        double availableWeight =
                BATTERY_WEIGHT
                + SLEEP_WEIGHT
                + LOAD_WEIGHT
                + SORENESS_WEIGHT;

        if (restScore != null) {

            weightedScore += REST_WEIGHT * restScore;

            availableWeight += REST_WEIGHT;
        }

        int finalScore = (int) Math.round(
                clamp(weightedScore / availableWeight)
        );

        return Optional.of(new Result(
                finalScore,
                bodyBattery,
                sleepScore,
                loadScore,
                sorenessScore,
                restScore,
                availableWeight,
                resolveLevel(finalScore),
                resolveRecommendation(finalScore),
                restScore != null
        ));
    }

    private static ReadinessLevel resolveLevel(int score) {

        if (score >= 90) {
            return ReadinessLevel.EXCELLENT;
        }

        if (score >= 75) {
            return ReadinessLevel.GOOD;
        }

        if (score >= 50) {
            return ReadinessLevel.MODERATE;
        }

        if (score >= 30) {
            return ReadinessLevel.LOW;
        }

        return ReadinessLevel.VERY_LOW;
    }

    private static RecoveryRecommendation
            resolveRecommendation(int score) {

        if (score >= 75) {
            return RecoveryRecommendation.NORMAL_TRAINING;
        }

        if (score >= 50) {
            return RecoveryRecommendation.MODERATE_TRAINING;
        }

        if (score >= 30) {
            return RecoveryRecommendation.LIGHT_ACTIVITY;
        }

        return RecoveryRecommendation.REST;
    }

    private static boolean isValidScore(Integer score) {

        return score != null &&
                score >= 0 &&
                score <= 100;
    }

    private static double clamp(double value) {

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }

    public enum ReadinessLevel {
        EXCELLENT,
        GOOD,
        MODERATE,
        LOW,
        VERY_LOW
    }

    public record Result(
            int score,
            int bodyBattery,
            int sleepScore,
            double loadScore,
            double sorenessScore,
            Double restScore,
            double availableWeight,
            ReadinessLevel level,
            RecoveryRecommendation recommendation,
            boolean complete
    ) {}
}
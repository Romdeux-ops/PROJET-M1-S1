package com.fitcoach.recovery.service.scoring;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * Modele experimental de reserve energetique.
 */
public final class BodyBatteryCalculator {

    private static final int INITIAL_BATTERY = 50;

    private static final double SLEEP_RECHARGE_FACTOR = 0.7;
    private static final double TRAINING_DRAIN_DIVISOR = 20.0;
    private static final double STRESS_DRAIN_FACTOR = 2.0;
    private static final double DAILY_DRAIN_FACTOR = 1.5;

    private static final double MODEL_WEIGHT = 0.8;
    private static final double ENERGY_WEIGHT = 0.2;

    private BodyBatteryCalculator() {
    }

    public static Optional<Result> calculate(
            Integer previousBodyBattery,
            Integer sleepScore,
            BigDecimal trainingLoad,
            Integer stressLevel,
            Double hoursAwake,
            Integer energyLevel
    ) {

        if (!isValidScore(sleepScore) ||
                trainingLoad == null ||
                trainingLoad.signum() < 0 ||
                !isValidLevel(stressLevel) ||
                hoursAwake == null ||
                !Double.isFinite(hoursAwake) ||
                hoursAwake < 0 ||
                hoursAwake > 24 ||
                !isValidLevel(energyLevel)) {

            return Optional.empty();
        }

        if (previousBodyBattery != null &&
                !isValidScore(previousBodyBattery)) {

            return Optional.empty();
        }

        boolean initialized =
                previousBodyBattery == null;

        double previousBattery = initialized
                ? INITIAL_BATTERY
                : previousBodyBattery;

        double sleepRecharge =
                sleepScore * SLEEP_RECHARGE_FACTOR;

        double morningBattery = clamp(
                previousBattery + sleepRecharge
        );

        double trainingDrain =
                trainingLoad.doubleValue()
                        / TRAINING_DRAIN_DIVISOR;

        if (!Double.isFinite(trainingDrain)) {
            return Optional.empty();
        }

        double stressDrain =
                stressLevel * STRESS_DRAIN_FACTOR;

        double dailyDrain =
                hoursAwake * DAILY_DRAIN_FACTOR;

        double estimatedBattery = clamp(
                morningBattery
                        - trainingDrain
                        - stressDrain
                        - dailyDrain
        );

        double declaredEnergy =
                energyLevel * 10.0;

        int finalScore = (int) Math.round(
                clamp(
                        MODEL_WEIGHT * estimatedBattery
                        + ENERGY_WEIGHT * declaredEnergy
                )
        );

        return Optional.of(new Result(
                finalScore,
                decimal(previousBattery),
                decimal(sleepRecharge),
                decimal(morningBattery),
                decimal(trainingDrain),
                decimal(stressDrain),
                decimal(dailyDrain),
                decimal(estimatedBattery),
                initialized
        ));
    }

    private static boolean isValidScore(Integer score) {

        return score != null &&
                score >= 0 &&
                score <= 100;
    }

    private static boolean isValidLevel(Integer level) {

        return level != null &&
                level >= 0 &&
                level <= 10;
    }

    private static double clamp(double value) {

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }

    private static BigDecimal decimal(double value) {

        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public record Result(
            int score,
            BigDecimal previousBodyBattery,
            BigDecimal sleepRecharge,
            BigDecimal morningBattery,
            BigDecimal trainingDrain,
            BigDecimal stressDrain,
            BigDecimal dailyDrain,
            BigDecimal estimatedBattery,
            boolean initialized
    ) {}
}
package com.fitcoach.recovery.service.scoring;

import com.fitcoach.recovery.domain.ActivityType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

/**
 * Estimation de la depense energetique a partir
 * du type d'activite, du poids, de la duree et du RPE.
 */
public final class CalorieCalculator {

    private static final Map<ActivityType, MetValues> MET_VALUES =
            Map.of(
                    ActivityType.STRENGTH,
                    new MetValues(3.0, 3.5, 6.0),

                    ActivityType.CARDIO,
                    new MetValues(4.0, 7.0, 9.0),

                    ActivityType.HIIT,
                    new MetValues(5.0, 8.0, 11.0),

                    ActivityType.RUNNING,
                    new MetValues(6.0, 8.5, 11.0),

                    ActivityType.CYCLING,
                    new MetValues(4.0, 6.8, 10.0),

                    ActivityType.WALKING,
                    new MetValues(2.5, 3.5, 5.0),

                    ActivityType.SWIMMING,
                    new MetValues(4.0, 6.0, 9.0),

                    ActivityType.YOGA,
                    new MetValues(2.0, 2.5, 4.0),

                    ActivityType.STRETCHING,
                    new MetValues(2.0, 2.3, 3.0)
            );

    private CalorieCalculator() {
    }

    public static Optional<Result> calculate(
            ActivityType activityType,
            BigDecimal weightKg,
            Integer durationMinutes,
            BigDecimal rpe
    ) {

        if (activityType == null ||
                weightKg == null ||
                durationMinutes == null ||
                rpe == null) {

            return Optional.empty();
        }

        if (weightKg.signum() <= 0 ||
                weightKg.compareTo(
                        BigDecimal.valueOf(500)
                ) >= 0 ||
                durationMinutes <= 0 ||
                durationMinutes > 600 ||
                rpe.compareTo(BigDecimal.ONE) < 0 ||
                rpe.compareTo(BigDecimal.TEN) > 0) {

            return Optional.empty();
        }

        MetValues values = MET_VALUES.get(activityType);

        if (values == null) {
            return Optional.empty();
        }

        Intensity intensity = resolveIntensity(rpe);

        BigDecimal met = BigDecimal.valueOf(
                switch (intensity) {
                    case LOW -> values.low();
                    case MODERATE -> values.moderate();
                    case HIGH -> values.high();
                }
        );

        BigDecimal duration =
                BigDecimal.valueOf(durationMinutes);

        BigDecimal totalCalories = met
                .multiply(weightKg)
                .multiply(duration)
                .divide(
                        BigDecimal.valueOf(60),
                        2,
                        RoundingMode.HALF_UP
                );

        BigDecimal activeCalories = met
                .subtract(BigDecimal.ONE)
                .multiply(weightKg)
                .multiply(duration)
                .divide(
                        BigDecimal.valueOf(60),
                        2,
                        RoundingMode.HALF_UP
                );

        return Optional.of(new Result(
                totalCalories,
                activeCalories,
                met,
                intensity
        ));
    }

    private static Intensity resolveIntensity(
            BigDecimal rpe
    ) {

        if (rpe.compareTo(BigDecimal.valueOf(3)) <= 0) {
            return Intensity.LOW;
        }

        if (rpe.compareTo(BigDecimal.valueOf(6)) <= 0) {
            return Intensity.MODERATE;
        }

        return Intensity.HIGH;
    }

    private record MetValues(
            double low,
            double moderate,
            double high
    ) {}

    public enum Intensity {
        LOW,
        MODERATE,
        HIGH
    }

    public record Result(
            BigDecimal totalCaloriesKcal,
            BigDecimal activeCaloriesKcal,
            BigDecimal met,
            Intensity intensity
    ) {}
}
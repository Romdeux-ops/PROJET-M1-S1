package com.fitcoach.recovery.service.scoring;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Estimation du score de sommeil sur 100.
 */
public final class SleepScoreCalculator {

    private static final double DURATION_WEIGHT = 0.40;
    private static final double QUALITY_WEIGHT = 0.30;
    private static final double REGULARITY_WEIGHT = 0.20;
    private static final double AWAKENINGS_WEIGHT = 0.10;

    private static final int MIN_HISTORY_NIGHTS = 3;
    private static final int MINUTES_PER_DAY = 1440;

    private SleepScoreCalculator() {
    }

    public static Optional<Result> calculate(
            long estimatedSleepMinutes,
            int targetSleepMinutes,
            int sleepQuality,
            Integer nightAwakenings,
            LocalTime bedtime,
            LocalTime wakeTime,
            List<SleepTiming> previousNights,
            boolean awakeMinutesKnown
    ) {

        if (estimatedSleepMinutes < 0 ||
                estimatedSleepMinutes > 1440 ||
                targetSleepMinutes < 240 ||
                targetSleepMinutes > 720 ||
                sleepQuality < 1 ||
                sleepQuality > 10 ||
                (nightAwakenings != null &&
                        (nightAwakenings < 0 ||
                         nightAwakenings > 100))) {

            return Optional.empty();
        }

        double durationScore = clamp(
                100.0 * estimatedSleepMinutes
                        / targetSleepMinutes
        );

        double qualityScore = sleepQuality * 10.0;

        Double regularityScore = calculateRegularity(
                bedtime,
                wakeTime,
                previousNights
        );

        Double awakeningsScore =
                nightAwakenings == null
                        ? null
                        : clamp(100.0 - 20.0 * nightAwakenings);

        double weightedScore =
                DURATION_WEIGHT * durationScore
                + QUALITY_WEIGHT * qualityScore;

        double availableWeight =
                DURATION_WEIGHT + QUALITY_WEIGHT;

        if (regularityScore != null) {

            weightedScore +=
                    REGULARITY_WEIGHT * regularityScore;

            availableWeight += REGULARITY_WEIGHT;
        }

        if (awakeningsScore != null) {

            weightedScore +=
                    AWAKENINGS_WEIGHT * awakeningsScore;

            availableWeight += AWAKENINGS_WEIGHT;
        }

        int finalScore = (int) Math.round(
                clamp(weightedScore / availableWeight)
        );

        boolean complete =
                awakeMinutesKnown &&
                regularityScore != null &&
                awakeningsScore != null;

        return Optional.of(new Result(
                finalScore,
                durationScore,
                qualityScore,
                regularityScore,
                awakeningsScore,
                availableWeight,
                complete
        ));
    }

    private static Double calculateRegularity(
            LocalTime bedtime,
            LocalTime wakeTime,
            List<SleepTiming> previousNights
    ) {

        if (bedtime == null ||
                wakeTime == null ||
                previousNights == null) {

            return null;
        }

        List<SleepTiming> validNights = previousNights
                .stream()
                .filter(night ->
                        night != null &&
                        night.bedtime() != null &&
                        night.wakeTime() != null
                )
                .toList();

        if (validNights.size() < MIN_HISTORY_NIGHTS) {
            return null;
        }

        double averageDeviation = validNights
                .stream()
                .mapToDouble(night -> {

                    int bedtimeDeviation =
                            circularDifference(
                                    bedtime,
                                    night.bedtime()
                            );

                    int wakeTimeDeviation =
                            circularDifference(
                                    wakeTime,
                                    night.wakeTime()
                            );

                    return (
                            bedtimeDeviation +
                            wakeTimeDeviation
                    ) / 2.0;
                })
                .average()
                .orElse(0.0);

        return clamp(
                100.0 - averageDeviation / 2.0
        );
    }

    private static int circularDifference(
            LocalTime first,
            LocalTime second
    ) {

        int firstMinutes =
                first.getHour() * 60 + first.getMinute();

        int secondMinutes =
                second.getHour() * 60 + second.getMinute();

        int difference = Math.abs(
                firstMinutes - secondMinutes
        );

        return Math.min(
                difference,
                MINUTES_PER_DAY - difference
        );
    }

    private static double clamp(double value) {

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }

    public record SleepTiming(
            LocalTime bedtime,
            LocalTime wakeTime
    ) {}

    public record Result(
            int score,
            double durationScore,
            double qualityScore,
            Double regularityScore,
            Double awakeningsScore,
            double availableWeight,
            boolean complete
    ) {}
}
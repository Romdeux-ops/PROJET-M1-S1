package com.fitcoach.recovery.service.scoring;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * Calcul de la charge sportive en unites arbitraires.
 */
public final class TrainingLoadCalculator {

    private static final BigDecimal YESTERDAY_WEIGHT =
            new BigDecimal("0.6");

    private static final BigDecimal TWO_DAYS_AGO_WEIGHT =
            new BigDecimal("0.3");

    private TrainingLoadCalculator() {
    }

    public static Optional<EffectiveRpe> resolveRpe(
            BigDecimal sessionRpe,
            BigDecimal averageSetRpe
    ) {

        if (isValidRpe(sessionRpe)) {
            return Optional.of(new EffectiveRpe(
                    sessionRpe,
                    RpeSource.SESSION
            ));
        }

        if (isValidRpe(averageSetRpe)) {
            return Optional.of(new EffectiveRpe(
                    averageSetRpe,
                    RpeSource.SET_AVERAGE
            ));
        }

        return Optional.empty();
    }

    public static Optional<Result> calculate(
            Integer durationMinutes,
            BigDecimal sessionRpe,
            BigDecimal averageSetRpe
    ) {

        if (durationMinutes == null ||
                durationMinutes <= 0 ||
                durationMinutes > 600) {

            return Optional.empty();
        }

        return resolveRpe(sessionRpe, averageSetRpe)
                .map(effectiveRpe -> {

                    BigDecimal load =
                            BigDecimal.valueOf(durationMinutes)
                                    .multiply(effectiveRpe.value())
                                    .setScale(
                                            2,
                                            RoundingMode.HALF_UP
                                    );

                    return new Result(
                            load,
                            effectiveRpe.value(),
                            effectiveRpe.source()
                    );
                });
    }

    public static Optional<BigDecimal> calculateRecentLoad(
            BigDecimal todayLoad,
            BigDecimal yesterdayLoad,
            BigDecimal twoDaysAgoLoad
    ) {

        if (!isValidLoad(todayLoad) ||
                !isValidLoad(yesterdayLoad) ||
                !isValidLoad(twoDaysAgoLoad)) {

            return Optional.empty();
        }

        return Optional.of(
                todayLoad
                        .add(
                                yesterdayLoad.multiply(
                                        YESTERDAY_WEIGHT
                                )
                        )
                        .add(
                                twoDaysAgoLoad.multiply(
                                        TWO_DAYS_AGO_WEIGHT
                                )
                        )
                        .setScale(2, RoundingMode.HALF_UP)
        );
    }

    private static boolean isValidRpe(BigDecimal rpe) {

        return rpe != null &&
                rpe.compareTo(BigDecimal.ONE) >= 0 &&
                rpe.compareTo(BigDecimal.TEN) <= 0;
    }

    private static boolean isValidLoad(BigDecimal load) {

        return load != null && load.signum() >= 0;
    }

    public enum RpeSource {
        SESSION,
        SET_AVERAGE
    }

    public record EffectiveRpe(
            BigDecimal value,
            RpeSource source
    ) {}

    public record Result(
            BigDecimal trainingLoad,
            BigDecimal effectiveRpe,
            RpeSource rpeSource
    ) {}
}
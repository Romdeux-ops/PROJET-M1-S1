package com.fitcoach.identity.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Interface publique de consultation
 * du poids corporel d'un athlete.
 */
public interface AthleteWeight {

    Optional<Measurement> latestWeight(
            UUID athleteId
    );

    Optional<Measurement> weightAt(
            UUID athleteId,
            LocalDate date
    );

    List<Measurement> weightHistory(
            UUID athleteId,
            LocalDate from,
            LocalDate to
    );

    record Measurement(

            BigDecimal weightKg,
            LocalDate measuredOn

    ) {}
}
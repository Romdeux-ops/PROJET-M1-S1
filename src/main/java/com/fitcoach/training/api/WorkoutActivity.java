package com.fitcoach.training.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Interface publique permettant de consulter
 * les activites sportives realisees par un athlete.
 */
public interface WorkoutActivity {

    List<Session> sessionsBetween(
            UUID athleteId,
            Instant fromInclusive,
            Instant toExclusive
    );

    Optional<Session> findSession(
            UUID athleteId,
            UUID workoutSessionId
    );

    Optional<Session> lastSessionBefore(
            UUID athleteId,
            Instant beforeExclusive
    );

    record Session(

            UUID id,
            String title,
            Instant performedAt,
            Integer durationMinutes,

            BigDecimal averageSetRpe,
            int totalSets,
            int setsWithRpe

    ) {}
}
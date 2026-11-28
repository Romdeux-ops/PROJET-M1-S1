package com.fitcoach.planning.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Point d'entree des autres modules
 * vers le planning d'un athlete.
 */
public interface AthletePlanning {

    /** Seances terminees en attente de validation du coach. */
    int pendingValidationCount(UUID athleteId);

    /** Prochaines seances planifiees, les plus proches d'abord. */
    List<UpcomingSession> upcoming(UUID athleteId, int limit);

    /**
     * Historique des seances programmees sur une periode.
     * Les deux dates sont incluses.
     */
    List<HistoricalSession> history(
            UUID athleteId,
            LocalDate from,
            LocalDate to
    );

    record HistoricalSession(
            UUID id,
            String title,
            LocalDate scheduledDate,
            SessionStatus status,
            UUID workoutSessionId
    ) {}

    enum SessionStatus {
        PLANNED,
        PENDING_VALIDATION,
        DONE,
        SKIPPED
    }
}
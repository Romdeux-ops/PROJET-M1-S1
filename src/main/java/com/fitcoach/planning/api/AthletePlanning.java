package com.fitcoach.planning.api;

import java.util.List;
import java.util.UUID;

/** Point d'entree des autres modules vers le planning d'un athlete. */
public interface AthletePlanning {

    /** Seances terminees par l'athlete et en attente de validation de son coach. */
    int pendingValidationCount(UUID athleteId);

    /** Prochaines seances planifiees (aujourd'hui inclus), les plus proches d'abord. */
    List<UpcomingSession> upcoming(UUID athleteId, int limit);
}

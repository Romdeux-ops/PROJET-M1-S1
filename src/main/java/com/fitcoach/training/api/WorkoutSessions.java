package com.fitcoach.training.api;

import java.util.UUID;

/** Point d'entree des autres modules vers le carnet d'entrainement. */
public interface WorkoutSessions {

    /** Faux aussi bien pour une seance inexistante que pour celle d'un autre athlete. */
    boolean isOwnedBy(UUID workoutSessionId, UUID athleteId);
}

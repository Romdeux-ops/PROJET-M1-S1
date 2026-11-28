package com.fitcoach.matching.api;

import java.util.UUID;

/** Point d'entree des autres modules vers les matchs FitMatch. */
public interface MatchRelations {

    /** Vrai si {@code coachId} et {@code athleteId} ont un match actif. */
    boolean isActiveMatch(UUID coachId, UUID athleteId);
}

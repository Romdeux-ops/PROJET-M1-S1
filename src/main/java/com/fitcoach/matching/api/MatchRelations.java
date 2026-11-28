package com.fitcoach.matching.api;

import java.util.Set;
import java.util.UUID;

/** Point d'entree des autres modules vers les matchs FitMatch. */
public interface MatchRelations {

    /** Vrai si {@code coachId} et {@code athleteId} ont un match actif. */
    boolean isActiveMatch(UUID coachId, UUID athleteId);

    /**
     * Personnes avec qui {@code userId} a eu un match, actif ou termine. Elles
     * ne connaissent que son prenom tant qu'aucune relation de coaching n'existe.
     */
    Set<UUID> matchedWith(UUID userId);
}

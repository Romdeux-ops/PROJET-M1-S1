package com.fitcoach.gamification.api;

import java.util.UUID;

/** Point d'entree des autres modules vers la gamification. */
public interface Achievements {

    /**
     * Decerne les badges que l'utilisateur merite desormais. Idempotent : sans
     * nouveau fait, il ne change rien. A appeler apres un evenement marquant
     * (seance enregistree, serie ajoutee, seance planifiee terminee).
     */
    void evaluate(UUID userId);
}

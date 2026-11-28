package com.fitcoach.matching.dto;

import com.fitcoach.matching.domain.SwipeDecision;

/**
 * Resultat d'un swipe.
 *
 * @param match le match actif de la paire, nul s'il n'y en a pas
 * @param newMatch vrai uniquement pour le swipe qui vient de creer le match :
 *     c'est lui qui declenche l'ecran "C'est un match !"
 */
public record SwipeResponse(SwipeDecision decision, MatchResponse match, boolean newMatch) {}

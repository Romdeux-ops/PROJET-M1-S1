package com.fitcoach.coaching.domain;

/**
 * Statut de la relation coach-athlete (colonne {@code coach_athlete.status}).
 *
 * <p>PENDING (invitation envoyee) vers ACTIVE ou DECLINED par l'athlete ;
 * ACTIVE vers ENDED par l'un ou l'autre. DECLINED et ENDED peuvent etre
 * relances par une nouvelle invitation. Seul ACTIVE ouvre des droits d'acces.
 */
public enum CoachAthleteStatus {
    PENDING,
    ACTIVE,
    DECLINED,
    ENDED
}

package com.fitcoach.coaching.domain;

/**
 * Statut de la relation coach-athlete (colonne {@code coach_athlete.status}).
 *
 * <p>PENDING (invitation du coach) vers ACTIVE ou DECLINED par l'athlete ;
 * REQUESTED (demande de l'athlete depuis le profil public du coach) vers ACTIVE
 * ou DECLINED par le coach ; ACTIVE vers ENDED par l'un ou l'autre. DECLINED et
 * ENDED peuvent etre relances. Seul ACTIVE ouvre des droits d'acces.
 */
public enum CoachAthleteStatus {
    PENDING,
    REQUESTED,
    ACTIVE,
    DECLINED,
    ENDED
}

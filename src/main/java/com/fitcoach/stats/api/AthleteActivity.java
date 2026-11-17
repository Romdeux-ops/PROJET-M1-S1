package com.fitcoach.stats.api;

import java.time.LocalDate;
import java.util.UUID;

/** Point d'entree des autres modules vers l'activite recente d'un athlete. */
public interface AthleteActivity {

    /**
     * @param sessionsLast30Days seances realisees sur les 30 derniers jours, aujourd'hui inclus
     * @param lastSessionDate jour local de la derniere seance, null si l'athlete n'a jamais ete actif
     * @param currentStreakDays jours consecutifs d'entrainement en cours
     */
    record Snapshot(int sessionsLast30Days, LocalDate lastSessionDate, int currentStreakDays) {}

    Snapshot snapshot(UUID athleteId);
}

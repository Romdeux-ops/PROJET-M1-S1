package com.fitcoach.planning.api;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Point d'entree des autres modules vers les seances planifiees a venir. */
public interface UpcomingSessions {

    /** Seances encore {@code PLANNED} dont la date est comprise (bornes incluses) entre les deux dates. */
    List<PlannedSession> plannedBetween(LocalDate from, LocalDate to);

    record PlannedSession(UUID id, UUID athleteId, String title, LocalDate scheduledDate) {}
}

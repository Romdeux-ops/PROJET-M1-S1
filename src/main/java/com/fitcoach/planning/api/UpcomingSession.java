package com.fitcoach.planning.api;

import java.time.LocalDate;
import java.util.UUID;

/** Seance planifiee a venir, vue minimale exposee aux autres modules. */
public record UpcomingSession(UUID id, String title, LocalDate scheduledDate) {}

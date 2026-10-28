package com.fitcoach.stats.dto;

import java.time.LocalDate;

/** {@code pending} : seances terminees en attente de validation par le coach. */
public record WeeklyAdherencePoint(LocalDate weekStart, int planned, int done, int skipped, int pending) {}

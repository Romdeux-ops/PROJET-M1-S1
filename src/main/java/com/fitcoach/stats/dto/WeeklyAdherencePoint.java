package com.fitcoach.stats.dto;

import java.time.LocalDate;

public record WeeklyAdherencePoint(LocalDate weekStart, int planned, int done, int skipped) {}

package com.fitcoach.stats.dto;

import java.time.LocalDate;

public record WeeklyActivityPoint(LocalDate date, int minutes) {}

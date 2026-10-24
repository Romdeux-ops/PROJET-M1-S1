package com.fitcoach.stats.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExerciseProgressionPoint(LocalDate date, BigDecimal maxWeight, BigDecimal estimated1Rm) {}

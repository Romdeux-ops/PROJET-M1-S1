package com.fitcoach.stats.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklyVolumePoint(LocalDate weekStart, BigDecimal totalVolume) {}

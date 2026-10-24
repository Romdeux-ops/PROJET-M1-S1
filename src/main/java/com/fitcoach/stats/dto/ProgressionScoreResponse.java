package com.fitcoach.stats.dto;

import java.math.BigDecimal;

/**
 * Variation du volume total (en %) entre les 30 derniers jours et les 30
 * jours precedents. Positif = progression, negatif = regression.
 */
public record ProgressionScoreResponse(
        BigDecimal last30DaysVolume, BigDecimal previous30DaysVolume, BigDecimal changePercent) {}

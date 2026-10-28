package com.fitcoach.stats.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MuscleVolumeShare(UUID muscleGroupId, String muscleGroupCode, String muscleGroupName, BigDecimal volume) {}

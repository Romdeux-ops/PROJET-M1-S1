package com.fitcoach.training.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record SessionSetRequest(
        @NotNull UUID exerciseId,
        @Min(1) int setNumber,
        @Min(1) @Max(200) int reps,
        @NotNull @DecimalMin("0") BigDecimal weightKg,
        @DecimalMin("1") @DecimalMax("10") BigDecimal rpe,
        @Min(0) @Max(1200) Integer restSeconds) {}

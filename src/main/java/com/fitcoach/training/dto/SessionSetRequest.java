package com.fitcoach.training.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record SessionSetRequest(
        @NotNull UUID exerciseId,
        @Min(1) int setNumber,
        @Min(1) @Max(200) int reps,
        // numeric(6,2) en base : au-dela, l'insertion echouerait au lieu d'un 400.
        @NotNull @DecimalMin("0") @DecimalMax("9999.99") @Digits(integer = 4, fraction = 2) BigDecimal weightKg,
        @DecimalMin("1") @DecimalMax("10") @Digits(integer = 2, fraction = 1) BigDecimal rpe,
        @Min(0) @Max(1200) Integer restSeconds) {}

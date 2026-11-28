package com.fitcoach.identity.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record BodyWeightRequest(

        @NotNull
        @DecimalMin(value = "0", inclusive = false)
        @DecimalMax(value = "500", inclusive = false)
        @Digits(integer = 3, fraction = 2)
        BigDecimal weightKg,

        @Size(max = 2000)
        String note

) {}
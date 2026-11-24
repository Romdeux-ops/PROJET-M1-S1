package com.fitcoach.nutrition.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateMealLogItemRequest(
        @NotNull
        @DecimalMin(value = "0.01")
        @Digits(integer = 6, fraction = 2)
        BigDecimal quantityG
) {}
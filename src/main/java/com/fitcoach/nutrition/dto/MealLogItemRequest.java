
package com.fitcoach.nutrition.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record MealLogItemRequest(
        @NotNull UUID foodId,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal quantityG
) {}

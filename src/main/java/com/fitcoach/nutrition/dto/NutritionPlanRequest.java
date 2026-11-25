
package com.fitcoach.nutrition.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record NutritionPlanRequest(
        @NotNull @Positive BigDecimal caloriesGoal,
        @NotNull @DecimalMin("0.0") BigDecimal proteinGoalG,
        @NotNull @DecimalMin("0.0") BigDecimal carbohydratesGoalG,
        @NotNull @DecimalMin("0.0") BigDecimal fatGoalG,
        @DecimalMin("0.0") BigDecimal fiberGoalG,
        LocalDate validFrom,
        LocalDate validTo
) {}

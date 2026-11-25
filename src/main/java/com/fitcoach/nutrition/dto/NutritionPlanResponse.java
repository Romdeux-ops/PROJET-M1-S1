
package com.fitcoach.nutrition.dto;

import com.fitcoach.nutrition.domain.NutritionPlan;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record NutritionPlanResponse(
        UUID id,
        BigDecimal caloriesGoal,
        BigDecimal proteinGoalG,
        BigDecimal carbohydratesGoalG,
        BigDecimal fatGoalG,
        BigDecimal fiberGoalG,
        LocalDate validFrom,
        LocalDate validTo
) {
    public static NutritionPlanResponse from(NutritionPlan plan) {
        return new NutritionPlanResponse(
                plan.getId(),
                plan.getCaloriesGoal(),
                plan.getProteinGoalG(),
                plan.getCarbohydratesGoalG(),
                plan.getFatGoalG(),
                plan.getFiberGoalG(),
                plan.getValidFrom(),
                plan.getValidTo()
        );
    }
}

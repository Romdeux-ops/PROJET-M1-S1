
package com.fitcoach.nutrition.dto;

import com.fitcoach.nutrition.domain.MealLogItem;
import java.math.BigDecimal;
import java.util.UUID;

public record MealLogItemResponse(
        UUID id,
        UUID foodId,
        String foodName,
        BigDecimal quantityG,
        BigDecimal caloriesKcal,
        BigDecimal proteinG,
        BigDecimal carbohydratesG,
        BigDecimal fatG,
        BigDecimal fiberG
) {
    public static MealLogItemResponse from(MealLogItem item) {
        return new MealLogItemResponse(
                item.getId(),
                item.getFoodId(),
                item.getFoodNameSnapshot(),
                item.getQuantityG(),
                item.getCaloriesKcal(),
                item.getProteinG(),
                item.getCarbohydratesG(),
                item.getFatG(),
                item.getFiberG()
        );
    }
}

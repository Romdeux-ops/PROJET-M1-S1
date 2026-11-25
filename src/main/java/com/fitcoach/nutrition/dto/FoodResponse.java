
package com.fitcoach.nutrition.dto;

import com.fitcoach.nutrition.domain.Food;
import java.math.BigDecimal;
import java.util.UUID;

public record FoodResponse(
        UUID id,
        String name,
        String category,
        BigDecimal caloriesKcal,
        BigDecimal proteinG,
        BigDecimal carbohydratesG,
        BigDecimal fatG,
        BigDecimal fiberG
) {
    public static FoodResponse from(Food food) {
        return new FoodResponse(
                food.getId(),
                food.getName(),
                food.getCategory(),
                food.getCaloriesKcal(),
                food.getProteinG(),
                food.getCarbohydratesG(),
                food.getFatG(),
                food.getFiberG()
        );
    }
}

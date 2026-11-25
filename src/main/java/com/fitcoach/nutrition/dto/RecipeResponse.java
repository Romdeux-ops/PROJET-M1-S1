package com.fitcoach.nutrition.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecipeResponse(
        UUID id,
        String name,
        String description,
        int servings,
        Integer preparationMinutes,
        String instructions,
        List<RecipeItemResponse> items,
        BigDecimal caloriesPerServing,
        BigDecimal proteinPerServingG,
        BigDecimal carbohydratesPerServingG,
        BigDecimal fatPerServingG,
        BigDecimal fiberPerServingG,
        Instant createdAt,
        Instant updatedAt
) {}
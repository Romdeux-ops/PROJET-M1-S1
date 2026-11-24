package com.fitcoach.nutrition.dto;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.Valid;

public record RecipeItemResponse(
        UUID id,
        UUID foodId,
        String foodName,
        BigDecimal quantityG,
        BigDecimal caloriesKcal,
        BigDecimal proteinG,
        BigDecimal carbohydratesG,
        BigDecimal fatG,
        BigDecimal fiberG
) {}
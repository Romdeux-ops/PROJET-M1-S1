
package com.fitcoach.nutrition.dto;

import com.fitcoach.nutrition.domain.MealType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record MealLogRequest(
        @NotNull MealType mealType,
        Instant consumedAt,
        @Size(max = 2000) String notes
) {}

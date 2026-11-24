
package com.fitcoach.nutrition.dto;

import com.fitcoach.nutrition.domain.MealLog;
import com.fitcoach.nutrition.domain.MealType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MealLogResponse(
        UUID id,
        MealType mealType,
        Instant consumedAt,
        String notes,
        List<MealLogItemResponse> items,
        Instant createdAt
) {
    public static MealLogResponse from(MealLog mealLog, List<MealLogItemResponse> items) {
        return new MealLogResponse(
                mealLog.getId(),
                mealLog.getMealType(),
                mealLog.getConsumedAt(),
                mealLog.getNotes(),
                items,
                mealLog.getCreatedAt()
        );
    }
}


package com.fitcoach.nutrition.repository;

import com.fitcoach.nutrition.domain.MealLogItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealLogItemRepository
        extends JpaRepository<MealLogItem, UUID> {

    List<MealLogItem> findAllByMealLogIdOrderByCreatedAtAsc(
            UUID mealLogId
    );

    Optional<MealLogItem> findByIdAndMealLogId(
            UUID id,
            UUID mealLogId
    );

    void deleteAllByMealLogId(UUID mealLogId);
}

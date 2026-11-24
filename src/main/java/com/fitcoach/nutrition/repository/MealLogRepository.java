
package com.fitcoach.nutrition.repository;

import com.fitcoach.nutrition.domain.MealLog;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealLogRepository extends JpaRepository<MealLog, UUID> {

    List<MealLog> findAllByUserIdAndConsumedAtBetweenOrderByConsumedAtDesc(
            UUID userId,
            Instant start,
            Instant end
    );

    Optional<MealLog> findByIdAndUserId(UUID id, UUID userId);
}

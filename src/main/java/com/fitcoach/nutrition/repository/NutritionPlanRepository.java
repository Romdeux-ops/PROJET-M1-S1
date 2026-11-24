
package com.fitcoach.nutrition.repository;

import com.fitcoach.nutrition.domain.NutritionPlan;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NutritionPlanRepository
        extends JpaRepository<NutritionPlan, UUID> {

    List<NutritionPlan> findAllByUserIdOrderByValidFromDesc(
            UUID userId
    );

    Optional<NutritionPlan> findFirstByUserIdAndValidFromLessThanEqualOrderByValidFromDesc(
            UUID userId,
            LocalDate date
    );

    Optional<NutritionPlan> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    @Query("""
            SELECT COUNT(p)
            FROM NutritionPlan p
            WHERE p.userId = :userId
              AND (
                  p.validTo IS NULL
                  OR p.validTo >= :validFrom
              )
              AND p.validFrom <= :validTo
            """)
    long countOverlappingPlans(
            @Param("userId") UUID userId,
            @Param("validFrom") LocalDate validFrom,
            @Param("validTo") LocalDate validTo
    );

    @Query("""
            SELECT COUNT(p)
            FROM NutritionPlan p
            WHERE p.userId = :userId
              AND (
                  p.validTo IS NULL
                  OR p.validTo >= :validFrom
              )
            """)
    long countOverlappingOpenEndedPlans(
            @Param("userId") UUID userId,
            @Param("validFrom") LocalDate validFrom
    );
}

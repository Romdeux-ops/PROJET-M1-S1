
package com.fitcoach.nutrition.service;

import com.fitcoach.nutrition.domain.NutritionPlan;
import com.fitcoach.nutrition.dto.NutritionPlanRequest;
import com.fitcoach.nutrition.dto.NutritionPlanResponse;
import com.fitcoach.nutrition.exception.InvalidNutritionPlanException;
import com.fitcoach.nutrition.exception.NutritionPlanNotFoundException;
import com.fitcoach.nutrition.repository.NutritionPlanRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NutritionPlanService {

    private final NutritionPlanRepository nutritionPlanRepository;

    public NutritionPlanService(
            NutritionPlanRepository nutritionPlanRepository
    ) {
        this.nutritionPlanRepository = nutritionPlanRepository;
    }

    public List<NutritionPlanResponse> getAllPlans(UUID userId) {
        return nutritionPlanRepository
                .findAllByUserIdOrderByValidFromDesc(userId)
                .stream()
                .map(NutritionPlanResponse::from)
                .toList();
    }

    public NutritionPlanResponse getCurrentPlan(UUID userId) {
        return getPlanForDate(userId, LocalDate.now());
    }

    public NutritionPlanResponse getPlanForDate(
            UUID userId,
            LocalDate date
    ) {
        NutritionPlan plan = nutritionPlanRepository
                .findFirstByUserIdAndValidFromLessThanEqualOrderByValidFromDesc(
                        userId,
                        date
                )
                .filter(candidate ->
                        candidate.getValidTo() == null
                        || !candidate.getValidTo().isBefore(date)
                )
                .orElseThrow(NutritionPlanNotFoundException::new);

        return NutritionPlanResponse.from(plan);
    }

    @Transactional
    public NutritionPlanResponse createPlan(
            UUID userId,
            NutritionPlanRequest request
    ) {
        LocalDate validFrom = request.validFrom() != null
                ? request.validFrom()
                : LocalDate.now();

        LocalDate validTo = request.validTo();

        validateDates(validFrom, validTo);

        validateNoOverlap(userId, validFrom, validTo);

        NutritionPlan plan = new NutritionPlan(
                userId,
                request.caloriesGoal(),
                request.proteinGoalG(),
                request.carbohydratesGoalG(),
                request.fatGoalG(),
                request.fiberGoalG(),
                validFrom,
                validTo
        );

        return NutritionPlanResponse.from(
                nutritionPlanRepository.save(plan)
        );
    }

    private void validateDates(
            LocalDate validFrom,
            LocalDate validTo
    ) {
        if (validTo != null && validTo.isBefore(validFrom)) {
            throw new InvalidNutritionPlanException(
                    "La date de fin doit être postérieure "
                    + "ou égale à la date de début."
            );
        }
    }

    private void validateNoOverlap(
            UUID userId,
            LocalDate validFrom,
            LocalDate validTo
    ) {
        long overlappingPlans;

        if (validTo == null) {
            overlappingPlans = nutritionPlanRepository
                    .countOverlappingOpenEndedPlans(
                            userId,
                            validFrom
                    );
        } else {
            overlappingPlans = nutritionPlanRepository
                    .countOverlappingPlans(
                            userId,
                            validFrom,
                            validTo
                    );
        }

        if (overlappingPlans > 0) {
            throw new InvalidNutritionPlanException(
                    "Un objectif nutritionnel existe déjà "
                    + "sur cette période. "
                    + "Veuillez choisir des dates différentes."
            );
        }
    }
}

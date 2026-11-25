
package com.fitcoach.nutrition.service;

import com.fitcoach.nutrition.domain.Food;
import com.fitcoach.nutrition.domain.MealLog;
import com.fitcoach.nutrition.domain.MealLogItem;
import com.fitcoach.nutrition.dto.MealLogItemRequest;
import com.fitcoach.nutrition.dto.MealLogItemResponse;
import com.fitcoach.nutrition.dto.MealLogRequest;
import com.fitcoach.nutrition.dto.MealLogResponse;
import com.fitcoach.nutrition.dto.UpdateMealLogItemRequest;
import com.fitcoach.nutrition.exception.FoodNotFoundException;
import com.fitcoach.nutrition.exception.InvalidMealLogException;
import com.fitcoach.nutrition.exception.MealLogNotFoundException;
import com.fitcoach.nutrition.exception.MealLogItemNotFoundException;
import com.fitcoach.nutrition.repository.FoodRepository;
import com.fitcoach.nutrition.repository.MealLogItemRepository;
import com.fitcoach.nutrition.repository.MealLogRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MealLogService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final int NUTRITION_SCALE = 2;

    private final MealLogRepository mealLogRepository;
    private final MealLogItemRepository mealLogItemRepository;
    private final FoodRepository foodRepository;

    public MealLogService(
            MealLogRepository mealLogRepository,
            MealLogItemRepository mealLogItemRepository,
            FoodRepository foodRepository
    ) {
        this.mealLogRepository = mealLogRepository;
        this.mealLogItemRepository = mealLogItemRepository;
        this.foodRepository = foodRepository;
    }

    @Transactional
    public MealLogResponse createMealLog(
            UUID userId,
            MealLogRequest request
    ) {
        MealLog mealLog = new MealLog(
                userId,
                request.mealType(),
                request.consumedAt(),
                request.notes()
        );

        MealLog savedMealLog = mealLogRepository.save(mealLog);

        return MealLogResponse.from(savedMealLog, List.of());
    }

    @Transactional
    public MealLogResponse addFoodToMeal(
            UUID userId,
            UUID mealLogId,
            MealLogItemRequest request
    ) {
        MealLog mealLog = getOwnedMealLog(userId, mealLogId);

        Food food = foodRepository.findById(request.foodId())
                .orElseThrow(FoodNotFoundException::new);

        BigDecimal quantityG = request.quantityG();

        MealLogItem item = new MealLogItem(
                mealLog.getId(),
                food.getId(),
                food.getName(),
                quantityG,
                calculateNutrition(food.getCaloriesKcal(), quantityG),
                calculateNutrition(food.getProteinG(), quantityG),
                calculateNutrition(food.getCarbohydratesG(), quantityG),
                calculateNutrition(food.getFatG(), quantityG),
                calculateNutrition(food.getFiberG(), quantityG)
        );

        mealLogItemRepository.save(item);

        return getMealLogResponse(mealLog);
    }

    // Modification de la quantité d'un aliment

    @Transactional
    public MealLogResponse updateMealItem(
            UUID userId,
            UUID mealLogId,
            UUID itemId,
            UpdateMealLogItemRequest request
    ) {
        MealLog mealLog = getOwnedMealLog(userId, mealLogId);

        MealLogItem item = getMealItem(mealLogId, itemId);

        Food food = foodRepository.findById(item.getFoodId())
                .orElseThrow(FoodNotFoundException::new);

        BigDecimal quantityG = request.quantityG();

        item.updateQuantityAndNutrition(
                quantityG,
                calculateNutrition(food.getCaloriesKcal(), quantityG),
                calculateNutrition(food.getProteinG(), quantityG),
                calculateNutrition(food.getCarbohydratesG(), quantityG),
                calculateNutrition(food.getFatG(), quantityG),
                calculateNutrition(food.getFiberG(), quantityG)
        );

        mealLogItemRepository.save(item);

        return getMealLogResponse(mealLog);
    }

    // Suppression individuelle d'un aliment

    @Transactional
    public MealLogResponse deleteMealItem(
            UUID userId,
            UUID mealLogId,
            UUID itemId
    ) {
        MealLog mealLog = getOwnedMealLog(userId, mealLogId);

        MealLogItem item = getMealItem(mealLogId, itemId);

        mealLogItemRepository.delete(item);

        return getMealLogResponse(mealLog);
    }

    public List<MealLogResponse> getMealLogs(
            UUID userId,
            Instant start,
            Instant end
    ) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new InvalidMealLogException(
                    "La période de consultation est invalide."
            );
        }

        return mealLogRepository
                .findAllByUserIdAndConsumedAtBetweenOrderByConsumedAtDesc(
                        userId, start, end
                )
                .stream()
                .map(this::getMealLogResponse)
                .toList();
    }

    public MealLogResponse getMealLog(
            UUID userId,
            UUID mealLogId
    ) {
        MealLog mealLog = getOwnedMealLog(userId, mealLogId);

        return getMealLogResponse(mealLog);
    }

    @Transactional
    public void deleteMealLog(
            UUID userId,
            UUID mealLogId
    ) {
        MealLog mealLog = getOwnedMealLog(userId, mealLogId);

        mealLogItemRepository.deleteAllByMealLogId(mealLog.getId());
        mealLogRepository.delete(mealLog);
    }

    private MealLog getOwnedMealLog(
            UUID userId,
            UUID mealLogId
    ) {
        return mealLogRepository
                .findByIdAndUserId(mealLogId, userId)
                .orElseThrow(MealLogNotFoundException::new);
    }

    private MealLogItem getMealItem(
            UUID mealLogId,
            UUID itemId
    ) {
        return mealLogItemRepository
                .findByIdAndMealLogId(itemId, mealLogId)
                .orElseThrow(MealLogItemNotFoundException::new);
    }

    private MealLogResponse getMealLogResponse(MealLog mealLog) {
        List<MealLogItemResponse> items = mealLogItemRepository
                .findAllByMealLogIdOrderByCreatedAtAsc(mealLog.getId())
                .stream()
                .map(MealLogItemResponse::from)
                .toList();

        return MealLogResponse.from(mealLog, items);
    }

    private BigDecimal calculateNutrition(
            BigDecimal valuePer100g,
            BigDecimal quantityG
    ) {
        return valuePer100g
                .multiply(quantityG)
                .divide(HUNDRED, NUTRITION_SCALE, RoundingMode.HALF_UP);
    }
}

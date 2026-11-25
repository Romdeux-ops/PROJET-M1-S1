
package com.fitcoach.nutrition.service;

import com.fitcoach.nutrition.domain.Food;
import com.fitcoach.nutrition.domain.Recipe;
import com.fitcoach.nutrition.domain.RecipeItem;
import com.fitcoach.nutrition.dto.RecipeItemRequest;
import com.fitcoach.nutrition.dto.RecipeItemResponse;
import com.fitcoach.nutrition.dto.RecipeRequest;
import com.fitcoach.nutrition.dto.RecipeResponse;
import com.fitcoach.nutrition.exception.FoodNotFoundException;
import com.fitcoach.nutrition.exception.InvalidRecipeException;
import com.fitcoach.nutrition.exception.RecipeNotFoundException;
import com.fitcoach.nutrition.repository.FoodRepository;
import com.fitcoach.nutrition.repository.RecipeItemRepository;
import com.fitcoach.nutrition.repository.RecipeRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecipeService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final int SCALE = 2;

    private final RecipeRepository recipeRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final FoodRepository foodRepository;

    public RecipeService(
            RecipeRepository recipeRepository,
            RecipeItemRepository recipeItemRepository,
            FoodRepository foodRepository
    ) {
        this.recipeRepository = recipeRepository;
        this.recipeItemRepository = recipeItemRepository;
        this.foodRepository = foodRepository;
    }

    public List<RecipeResponse> getAllRecipes(UUID userId) {
        return recipeRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RecipeResponse getRecipe(UUID userId, UUID recipeId) {
        return toResponse(getOwnedRecipe(userId, recipeId));
    }

    @Transactional
    public RecipeResponse createRecipe(UUID userId, RecipeRequest request) {
        validateRequest(request);

        Recipe recipe = new Recipe(
                userId,
                request.name(),
                request.description(),
                request.servings(),
                request.preparationMinutes(),
                request.instructions()
        );

        Recipe savedRecipe = recipeRepository.save(recipe);

        saveRecipeItems(savedRecipe.getId(), request.items());

        return toResponse(savedRecipe);
    }

    @Transactional
    public RecipeResponse updateRecipe(
            UUID userId,
            UUID recipeId,
            RecipeRequest request
    ) {
        validateRequest(request);

        Recipe recipe = getOwnedRecipe(userId, recipeId);

        recipe.updateDetails(
                request.name(),
                request.description(),
                request.servings(),
                request.preparationMinutes(),
                request.instructions()
        );

        recipeItemRepository.deleteAllByRecipeId(recipeId);
        saveRecipeItems(recipeId, request.items());

        return toResponse(recipe);
    }

    @Transactional
    public void deleteRecipe(UUID userId, UUID recipeId) {
        Recipe recipe = getOwnedRecipe(userId, recipeId);

        recipeItemRepository.deleteAllByRecipeId(recipeId);
        recipeRepository.delete(recipe);
    }

    private void validateRequest(RecipeRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new InvalidRecipeException(
                    "Une recette doit contenir au moins un ingrédient."
            );
        }

        if (request.servings() <= 0) {
            throw new InvalidRecipeException(
                    "Le nombre de portions doit être supérieur à zéro."
            );
        }
    }

    private Recipe getOwnedRecipe(UUID userId, UUID recipeId) {
        return recipeRepository.findByIdAndUserId(recipeId, userId)
                .orElseThrow(RecipeNotFoundException::new);
    }

    private void saveRecipeItems(
            UUID recipeId,
            List<RecipeItemRequest> items
    ) {
        List<RecipeItem> recipeItems = new ArrayList<>();

        for (int position = 0; position < items.size(); position++) {
            RecipeItemRequest item = items.get(position);

            foodRepository.findById(item.foodId())
                    .orElseThrow(FoodNotFoundException::new);

            recipeItems.add(new RecipeItem(
                    recipeId,
                    item.foodId(),
                    item.quantityG(),
                    position
            ));
        }

        recipeItemRepository.saveAll(recipeItems);
    }

    private RecipeResponse toResponse(Recipe recipe) {
        List<RecipeItemResponse> items = recipeItemRepository
                .findAllByRecipeIdOrderByPositionAsc(recipe.getId())
                .stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal calories = BigDecimal.ZERO;
        BigDecimal protein = BigDecimal.ZERO;
        BigDecimal carbohydrates = BigDecimal.ZERO;
        BigDecimal fat = BigDecimal.ZERO;
        BigDecimal fiber = BigDecimal.ZERO;

        for (RecipeItemResponse item : items) {
            calories = calories.add(item.caloriesKcal());
            protein = protein.add(item.proteinG());
            carbohydrates = carbohydrates.add(item.carbohydratesG());
            fat = fat.add(item.fatG());
            fiber = fiber.add(item.fiberG());
        }

        BigDecimal servings = BigDecimal.valueOf(recipe.getServings());

        return new RecipeResponse(
                recipe.getId(),
                recipe.getName(),
                recipe.getDescription(),
                recipe.getServings(),
                recipe.getPreparationMinutes(),
                recipe.getInstructions(),
                items,
                calories.divide(servings, SCALE, RoundingMode.HALF_UP),
                protein.divide(servings, SCALE, RoundingMode.HALF_UP),
                carbohydrates.divide(servings, SCALE, RoundingMode.HALF_UP),
                fat.divide(servings, SCALE, RoundingMode.HALF_UP),
                fiber.divide(servings, SCALE, RoundingMode.HALF_UP),
                recipe.getCreatedAt(),
                recipe.getUpdatedAt()
        );
    }

    private RecipeItemResponse toItemResponse(RecipeItem item) {
        Food food = foodRepository.findById(item.getFoodId())
                .orElseThrow(FoodNotFoundException::new);

        BigDecimal quantity = item.getQuantityG();

        return new RecipeItemResponse(
                item.getId(),
                food.getId(),
                food.getName(),
                quantity,
                calculateNutrition(food.getCaloriesKcal(), quantity),
                calculateNutrition(food.getProteinG(), quantity),
                calculateNutrition(food.getCarbohydratesG(), quantity),
                calculateNutrition(food.getFatG(), quantity),
                calculateNutrition(food.getFiberG(), quantity)
        );
    }

    private BigDecimal calculateNutrition(
            BigDecimal valuePer100g,
            BigDecimal quantityG
    ) {
        return valuePer100g
                .multiply(quantityG)
                .divide(HUNDRED, SCALE, RoundingMode.HALF_UP);
    }
}

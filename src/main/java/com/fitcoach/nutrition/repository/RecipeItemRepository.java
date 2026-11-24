package com.fitcoach.nutrition.repository;

import com.fitcoach.nutrition.domain.RecipeItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeItemRepository extends JpaRepository<RecipeItem, UUID> {

    List<RecipeItem> findAllByRecipeIdOrderByPositionAsc(UUID recipeId);

    void deleteAllByRecipeId(UUID recipeId);
}

package com.fitcoach.nutrition.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.nutrition.dto.RecipeRequest;
import com.fitcoach.nutrition.dto.RecipeResponse;
import com.fitcoach.nutrition.service.RecipeService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nutrition/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public List<RecipeResponse> getAllRecipes(
            Authentication authentication
    ) {
        return recipeService.getAllRecipes(
                AuthenticatedUsers.id(authentication)
        );
    }

    @GetMapping("/{recipeId}")
    public RecipeResponse getRecipe(
            Authentication authentication,
            @PathVariable UUID recipeId
    ) {
        return recipeService.getRecipe(
                AuthenticatedUsers.id(authentication),
                recipeId
        );
    }

    @PostMapping
    public ResponseEntity<RecipeResponse> createRecipe(
            Authentication authentication,
            @Valid @RequestBody RecipeRequest request
    ) {
        RecipeResponse recipe = recipeService.createRecipe(
                AuthenticatedUsers.id(authentication),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(recipe);
    }

    @PutMapping("/{recipeId}")
    public RecipeResponse updateRecipe(
            Authentication authentication,
            @PathVariable UUID recipeId,
            @Valid @RequestBody RecipeRequest request
    ) {
        return recipeService.updateRecipe(
                AuthenticatedUsers.id(authentication),
                recipeId,
                request
        );
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> deleteRecipe(
            Authentication authentication,
            @PathVariable UUID recipeId
    ) {
        recipeService.deleteRecipe(
                AuthenticatedUsers.id(authentication),
                recipeId
        );

        return ResponseEntity.noContent().build();
    }
}

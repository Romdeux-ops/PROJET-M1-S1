
package com.fitcoach.nutrition.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "recipe_items")
public class RecipeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recipe_id", nullable = false)
    private UUID recipeId;

    @Column(name = "food_id", nullable = false)
    private UUID foodId;

    @Column(name = "quantity_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityG;

    @Column(nullable = false)
    private int position = 0;

    protected RecipeItem() {
        // JPA
    }

    public RecipeItem(UUID recipeId, UUID foodId, BigDecimal quantityG, int position) {
        this.recipeId = recipeId;
        this.foodId = foodId;
        this.quantityG = quantityG;
        this.position = position;
    }

    public UUID getId() {
        return id;
    }

    public UUID getRecipeId() {
        return recipeId;
    }

    public UUID getFoodId() {
        return foodId;
    }

    public BigDecimal getQuantityG() {
        return quantityG;
    }

    public int getPosition() {
        return position;
    }
}

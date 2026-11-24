
package com.fitcoach.nutrition.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meal_log_items")
public class MealLogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "meal_log_id", nullable = false)
    private UUID mealLogId;

    @Column(name = "food_id", nullable = false)
    private UUID foodId;

    @Column(name = "food_name_snapshot", nullable = false)
    private String foodNameSnapshot;

    @Column(name = "quantity_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityG;

    @Column(name = "calories_kcal", nullable = false, precision = 10, scale = 2)
    private BigDecimal caloriesKcal;

    @Column(name = "protein_g", nullable = false, precision = 10, scale = 2)
    private BigDecimal proteinG;

    @Column(name = "carbohydrates_g", nullable = false, precision = 10, scale = 2)
    private BigDecimal carbohydratesG;

    @Column(name = "fat_g", nullable = false, precision = 10, scale = 2)
    private BigDecimal fatG;

    @Column(name = "fiber_g", nullable = false, precision = 10, scale = 2)
    private BigDecimal fiberG = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected MealLogItem() {
        // JPA
    }

    public MealLogItem(
            UUID mealLogId,
            UUID foodId,
            String foodNameSnapshot,
            BigDecimal quantityG,
            BigDecimal caloriesKcal,
            BigDecimal proteinG,
            BigDecimal carbohydratesG,
            BigDecimal fatG,
            BigDecimal fiberG
    ) {
        this.mealLogId = mealLogId;
        this.foodId = foodId;
        this.foodNameSnapshot = foodNameSnapshot;
        this.quantityG = quantityG;
        this.caloriesKcal = caloriesKcal;
        this.proteinG = proteinG;
        this.carbohydratesG = carbohydratesG;
        this.fatG = fatG;
        this.fiberG = fiberG != null ? fiberG : BigDecimal.ZERO;
    }
    public void updateQuantityAndNutrition(
        BigDecimal quantityG,
        BigDecimal caloriesKcal,
        BigDecimal proteinG,
        BigDecimal carbohydratesG,
        BigDecimal fatG,
        BigDecimal fiberG
    ) {
        this.quantityG = quantityG;
        this.caloriesKcal = caloriesKcal;
        this.proteinG = proteinG;
        this.carbohydratesG = carbohydratesG;
        this.fatG = fatG;
        this.fiberG = fiberG != null
                ? fiberG
                : BigDecimal.ZERO;
    }

    public UUID getId() {
        return id;
    }

    public UUID getMealLogId() {
        return mealLogId;
    }

    public UUID getFoodId() {
        return foodId;
    }

    public String getFoodNameSnapshot() {
        return foodNameSnapshot;
    }

    public BigDecimal getQuantityG() {
        return quantityG;
    }

    public BigDecimal getCaloriesKcal() {
        return caloriesKcal;
    }

    public BigDecimal getProteinG() {
        return proteinG;
    }

    public BigDecimal getCarbohydratesG() {
        return carbohydratesG;
    }

    public BigDecimal getFatG() {
        return fatG;
    }

    public BigDecimal getFiberG() {
        return fiberG;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}


package com.fitcoach.nutrition.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "nutrition_plans")
public class NutritionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "calories_goal", nullable = false, precision = 8, scale = 2)
    private BigDecimal caloriesGoal;

    @Column(name = "protein_goal_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal proteinGoalG;

    @Column(name = "carbohydrates_goal_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbohydratesGoalG;

    @Column(name = "fat_goal_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal fatGoalG;

    @Column(name = "fiber_goal_g", precision = 8, scale = 2)
    private BigDecimal fiberGoalG;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected NutritionPlan() {
        // JPA
    }

    public NutritionPlan(
            UUID userId,
            BigDecimal caloriesGoal,
            BigDecimal proteinGoalG,
            BigDecimal carbohydratesGoalG,
            BigDecimal fatGoalG,
            BigDecimal fiberGoalG,
            LocalDate validFrom,
            LocalDate validTo
    ) {
        this.userId = userId;
        this.caloriesGoal = caloriesGoal;
        this.proteinGoalG = proteinGoalG;
        this.carbohydratesGoalG = carbohydratesGoalG;
        this.fatGoalG = fatGoalG;
        this.fiberGoalG = fiberGoalG;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public BigDecimal getCaloriesGoal() {
        return caloriesGoal;
    }

    public BigDecimal getProteinGoalG() {
        return proteinGoalG;
    }

    public BigDecimal getCarbohydratesGoalG() {
        return carbohydratesGoalG;
    }

    public BigDecimal getFatGoalG() {
        return fatGoalG;
    }

    public BigDecimal getFiberGoalG() {
        return fiberGoalG;
    }

    public LocalDate getValidFrom() {
        return validFrom;
    }

    public LocalDate getValidTo() {
        return validTo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public boolean isOwnedBy(UUID userId) {
        return this.userId.equals(userId);
    }
}

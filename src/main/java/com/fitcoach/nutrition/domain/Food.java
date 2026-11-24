
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
@Table(name = "foods")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;

    @Column(name = "calories_kcal", nullable = false, precision = 8, scale = 2)
    private BigDecimal caloriesKcal;

    @Column(name = "protein_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal proteinG;

    @Column(name = "carbohydrates_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbohydratesG;

    @Column(name = "fat_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal fatG;

    @Column(name = "fiber_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal fiberG = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected Food() {
        // JPA
    }

    public Food(
            String name,
            String category,
            BigDecimal caloriesKcal,
            BigDecimal proteinG,
            BigDecimal carbohydratesG,
            BigDecimal fatG,
            BigDecimal fiberG
    ) {
        this.name = name;
        this.category = category;
        this.caloriesKcal = caloriesKcal;
        this.proteinG = proteinG;
        this.carbohydratesG = carbohydratesG;
        this.fatG = fatG;
        this.fiberG = fiberG != null ? fiberG : BigDecimal.ZERO;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
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

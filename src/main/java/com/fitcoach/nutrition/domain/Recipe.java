
package com.fitcoach.nutrition.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private int servings = 1;

    @Column(name = "preparation_minutes")
    private Integer preparationMinutes;

    private String instructions;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Recipe() {
        // JPA
    }

    public Recipe(
            UUID userId,
            String name,
            String description,
            int servings,
            Integer preparationMinutes,
            String instructions
    ) {
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.servings = servings;
        this.preparationMinutes = preparationMinutes;
        this.instructions = instructions;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getServings() {
        return servings;
    }

    public Integer getPreparationMinutes() {
        return preparationMinutes;
    }

    public String getInstructions() {
        return instructions;
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
    public void updateDetails(
        String name,
        String description,
        int servings,
        Integer preparationMinutes,
        String instructions
    ) {
        this.name = name;
        this.description = description;
        this.servings = servings;
        this.preparationMinutes = preparationMinutes;
        this.instructions = instructions;
    }
}

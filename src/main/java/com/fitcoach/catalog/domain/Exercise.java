package com.fitcoach.catalog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Fiche exercice (table {@code exercises}, V4).
 */
@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    private String description;

    private String equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseDifficulty difficulty = ExerciseDifficulty.BEGINNER;

    @Column(name = "default_rest_seconds", nullable = false)
    private int defaultRestSeconds = 90;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Exercise() {
        // JPA
    }

    public Exercise(String slug, String name, UUID createdBy) {
        this.slug = slug;
        this.name = name;
        this.createdBy = createdBy;
    }

    public UUID getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public ExerciseDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(ExerciseDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public int getDefaultRestSeconds() {
        return defaultRestSeconds;
    }

    public void setDefaultRestSeconds(int defaultRestSeconds) {
        this.defaultRestSeconds = defaultRestSeconds;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

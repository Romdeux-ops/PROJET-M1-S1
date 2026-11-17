package com.fitcoach.program.domain;

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
 * Programme d'entrainement (table {@code programs}, V6).
 */
@Entity
@Table(name = "programs")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramLevel level = ProgramLevel.BEGINNER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramVisibility visibility = ProgramVisibility.PRIVATE;

    @Column(name = "share_token", nullable = false, unique = true)
    private String shareToken;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Program() {
        // JPA
    }

    public Program(UUID ownerId, String title, ProgramCategory category, String shareToken) {
        this.ownerId = ownerId;
        this.title = title;
        this.category = category;
        this.shareToken = shareToken;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProgramCategory getCategory() {
        return category;
    }

    public void setCategory(ProgramCategory category) {
        this.category = category;
    }

    public ProgramLevel getLevel() {
        return level;
    }

    public void setLevel(ProgramLevel level) {
        this.level = level;
    }

    public ProgramVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(ProgramVisibility visibility) {
        this.visibility = visibility;
    }

    public String getShareToken() {
        return shareToken;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public boolean isOwnedBy(UUID userId) {
        return ownerId.equals(userId);
    }

}

package com.fitcoach.coaching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/** Publication d'un coach sur son profil (table {@code coach_posts}, V3). */
@Entity
@Table(name = "coach_posts")
public class CoachPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "coach_id", nullable = false)
    private UUID coachId;

    @Column(nullable = false)
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected CoachPost() {
        // JPA
    }

    public CoachPost(UUID coachId, String content, String imageUrl) {
        this.coachId = coachId;
        this.content = content;
        this.imageUrl = imageUrl;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public String getContent() {
        return content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

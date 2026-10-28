package com.fitcoach.program.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "program_ratings")
@IdClass(ProgramRatingId.class)
public class ProgramRating {

    @Id
    @Column(name = "program_id")
    private UUID programId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private int stars;

    private String comment;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected ProgramRating() {
        // JPA
    }

    public ProgramRating(UUID programId, UUID userId, int stars, String comment) {
        this.programId = programId;
        this.userId = userId;
        this.stars = stars;
        this.comment = comment;
    }

    public UUID getProgramId() {
        return programId;
    }

    public UUID getUserId() {
        return userId;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}

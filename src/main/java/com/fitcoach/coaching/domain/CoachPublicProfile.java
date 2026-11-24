package com.fitcoach.coaching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/** Profil public d'un coach (table {@code coach_public_profiles}, V16) : invisible tant que {@code enabled} est faux. */
@Entity
@Table(name = "coach_public_profiles")
public class CoachPublicProfile {

    @Id
    @Column(name = "coach_id")
    private UUID coachId;

    @Column(nullable = false)
    private boolean enabled;

    private String headline;

    private String bio;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected CoachPublicProfile() {
        // JPA
    }

    public CoachPublicProfile(UUID coachId) {
        this.coachId = coachId;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String getHeadline() {
        return headline;
    }

    public String getBio() {
        return bio;
    }

    public void update(boolean enabled, String headline, String bio) {
        this.enabled = enabled;
        this.headline = blankToNull(headline);
        this.bio = blankToNull(bio);
        this.updatedAt = Instant.now();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}

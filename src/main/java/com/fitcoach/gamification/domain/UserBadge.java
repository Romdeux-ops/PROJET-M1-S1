package com.fitcoach.gamification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Badge gagne par un utilisateur (table {@code user_badges}, V11).
 *
 * <p>Un badge, une fois decerne, reste acquis : la ligne fige la date
 * d'obtention meme si la metrique repasse ensuite sous le seuil (suppression
 * de seances, par exemple).
 */
@Entity
@Table(name = "user_badges")
@IdClass(UserBadgeId.class)
public class UserBadge {

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Id
    @Column(name = "badge_id", nullable = false, updatable = false)
    private UUID badgeId;

    @Column(name = "awarded_at", nullable = false, insertable = false, updatable = false)
    private Instant awardedAt;

    protected UserBadge() {
        // JPA
    }

    public UserBadge(UUID userId, UUID badgeId) {
        this.userId = userId;
        this.badgeId = badgeId;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getBadgeId() {
        return badgeId;
    }

    public Instant getAwardedAt() {
        return awardedAt;
    }
}

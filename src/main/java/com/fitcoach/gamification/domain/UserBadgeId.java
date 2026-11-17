package com.fitcoach.gamification.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/** Cle composite de {@link UserBadge}. */
public class UserBadgeId implements Serializable {

    private UUID userId;
    private UUID badgeId;

    protected UserBadgeId() {
        // JPA
    }

    public UserBadgeId(UUID userId, UUID badgeId) {
        this.userId = userId;
        this.badgeId = badgeId;
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof UserBadgeId that
                && Objects.equals(userId, that.userId)
                && Objects.equals(badgeId, that.badgeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, badgeId);
    }
}

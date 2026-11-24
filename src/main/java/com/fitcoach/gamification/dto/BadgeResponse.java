package com.fitcoach.gamification.dto;

import com.fitcoach.gamification.domain.Badge;
import java.time.Instant;
import java.util.UUID;

/** Un badge du catalogue ; {@code awardedAt} est nul tant qu'il n'est pas gagne. */
public record BadgeResponse(
        UUID id, String code, String name, String description, int threshold, Instant awardedAt) {

    public static BadgeResponse from(Badge badge, Instant awardedAt) {
        return new BadgeResponse(
                badge.getId(),
                badge.getCode(),
                badge.getName(),
                badge.getDescription(),
                badge.getThreshold(),
                awardedAt);
    }
}

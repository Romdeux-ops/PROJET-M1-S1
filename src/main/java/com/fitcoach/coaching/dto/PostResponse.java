package com.fitcoach.coaching.dto;

import com.fitcoach.coaching.domain.CoachPost;
import com.fitcoach.identity.domain.User;
import java.time.Instant;
import java.util.UUID;

public record PostResponse(
        UUID id,
        UUID coachId,
        String coachName,
        String coachAvatarUrl,
        String content,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt) {

    public static PostResponse from(CoachPost post, User coach) {
        String storedImage = post.getImageUrl();
        String imageUrl = (storedImage == null || storedImage.isBlank())
                ? null
                : "/api/coaching/posts/images/" + storedImage.substring("posts/".length());
        return new PostResponse(
                post.getId(),
                post.getCoachId(),
                coach.getFirstName() + " " + coach.getLastName(),
                coach.getAvatarUrl(),
                post.getContent(),
                imageUrl,
                post.getCreatedAt(),
                post.getUpdatedAt());
    }
}

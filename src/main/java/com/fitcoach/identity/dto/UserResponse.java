package com.fitcoach.identity.dto;

import com.fitcoach.identity.domain.RoleCode;
import com.fitcoach.identity.domain.User;
import java.util.List;
import java.util.UUID;

/**
 * Correspond a {@code SessionUser} cote frontend
 * (frontend/src/lib/auth/session.ts).
 */
public record UserResponse(
        UUID id, String email, String firstName, String lastName, List<RoleCode> roles, String avatarUrl) {

    public static UserResponse from(User user) {
        List<RoleCode> sortedRoles = user.getRoles().stream().sorted().toList();
        return new UserResponse(
                user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), sortedRoles, user.getAvatarUrl());
    }
}

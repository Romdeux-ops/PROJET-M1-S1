package com.fitcoach.identity.dto;

import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.domain.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Vue complete du profil ({@code GET/PATCH /api/users/me/profile}). */
public record ProfileResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        List<RoleCode> roles,
        String avatarUrl,
        String bio,
        LocalDate birthDate,
        BigDecimal heightCm,
        String fitnessGoal,
        String experienceLevel,
        String unitSystem,
        String locale,
        boolean notificationsEnabled) {

    public static ProfileResponse from(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles().stream().sorted().toList(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getBirthDate(),
                user.getHeightCm(),
                user.getFitnessGoal(),
                user.getExperienceLevel(),
                user.getUnitSystem(),
                user.getLocale(),
                user.isNotificationsEnabled());
    }
}

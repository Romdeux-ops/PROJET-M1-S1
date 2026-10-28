package com.fitcoach.identity.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * {@code PATCH /api/users/me/profile}. Tous les champs sont optionnels : seuls
 * ceux non nuls sont appliques (semantique partielle, pas un remplacement
 * complet).
 */
public record UpdateProfileRequest(
        @Size(max = 50) String firstName,
        @Size(max = 50) String lastName,
        @Size(max = 1000) String bio,
        @Past LocalDate birthDate,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("300") BigDecimal heightCm,
        @Pattern(regexp = "WEIGHT_LOSS|MUSCLE_GAIN|ENDURANCE|GENERAL_FITNESS") String fitnessGoal,
        @Pattern(regexp = "BEGINNER|INTERMEDIATE|ADVANCED") String experienceLevel,
        @Pattern(regexp = "METRIC|IMPERIAL") String unitSystem,
        @Pattern(regexp = "fr|en") String locale,
        Boolean notificationsEnabled) {}

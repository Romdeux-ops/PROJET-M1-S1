package com.fitcoach.identity.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
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
        @Size(max = 50) @Pattern(regexp = ".*\\S.*", message = "ne doit pas etre vide") String firstName,
        @Size(max = 50) @Pattern(regexp = ".*\\S.*", message = "ne doit pas etre vide") String lastName,
        @Size(max = 1000) String bio,
        @Past LocalDate birthDate,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "300", inclusive = false)
                @Digits(integer = 3, fraction = 1)
                BigDecimal heightCm,
        @Pattern(regexp = "WEIGHT_LOSS|MUSCLE_GAIN|ENDURANCE|GENERAL_FITNESS") String fitnessGoal,
        @Pattern(regexp = "BEGINNER|INTERMEDIATE|ADVANCED") String experienceLevel,
        @Pattern(regexp = "METRIC|IMPERIAL") String unitSystem,
        @Pattern(regexp = "fr|en") String locale,
        Boolean notificationsEnabled) {}

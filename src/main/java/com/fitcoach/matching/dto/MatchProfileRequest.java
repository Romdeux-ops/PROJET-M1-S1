package com.fitcoach.matching.dto;

import com.fitcoach.matching.domain.TrainingMode;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * {@code PUT /api/matching/profile} : cree ou remplace le profil FitMatch.
 *
 * <p>{@code birthDate} et {@code heightCm} completent le compte uniquement
 * s'il ne les connait pas encore (memes contraintes que le profil du compte) ;
 * une valeur deja connue se modifie depuis {@code PATCH /api/users/me/profile}. {@code goals} et {@code levels} ne
 * concernent que les coachs, {@code maxBudgetEur} que les athletes et
 * {@code sessionRateEur} que les coachs : le reste est ignore.
 */
public record MatchProfileRequest(
        @NotBlank @Size(max = 120) String headline,
        @Size(max = 1000) String about,
        @NotEmpty @Size(max = 8) List<@NotNull @Pattern(regexp = SPORTS) String> sports,
        @Size(max = 4) List<@NotNull @Pattern(regexp = GOALS) String> goals,
        @Size(max = 3) List<@NotNull @Pattern(regexp = LEVELS) String> levels,
        @NotEmpty @Size(max = 4) List<@NotNull @Pattern(regexp = SLOTS) String> availability,
        @NotNull TrainingMode trainingMode,
        @Size(max = 80) String city,
        @Min(0) @Max(1000) Integer maxBudgetEur,
        @Min(0) @Max(1000) Integer sessionRateEur,
        Boolean visible,
        @Past LocalDate birthDate,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax(value = "300", inclusive = false)
                @Digits(integer = 3, fraction = 1)
                BigDecimal heightCm) {

    public static final String SPORTS = "STRENGTH|RUNNING|CYCLING|SWIMMING|CROSSFIT|HIIT|YOGA|PILATES|BOXING"
            + "|MARTIAL_ARTS|CLIMBING|TRIATHLON|FOOTBALL|BASKETBALL|TENNIS|DANCE";
    public static final String GOALS = "WEIGHT_LOSS|MUSCLE_GAIN|ENDURANCE|GENERAL_FITNESS";
    public static final String LEVELS = "BEGINNER|INTERMEDIATE|ADVANCED";
    public static final String SLOTS = "MORNING|NOON|EVENING|WEEKEND";
}

package com.fitcoach.matching.dto;

import com.fitcoach.matching.domain.MatchProfile;
import com.fitcoach.matching.domain.MatchSide;
import com.fitcoach.matching.domain.TrainingMode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * {@code GET/PUT /api/matching/profile} : ce que le compte sait deja (pour
 * pre-remplir le formulaire), les informations manquantes et, une fois cree,
 * le profil FitMatch lui-meme ({@code profile} est nul avant l'inscription).
 *
 * @param missing codes stables des donnees du compte a completer :
 *     {@code BIRTH_DATE} (obligatoire), {@code HEIGHT} (facultatif)
 */
public record MyMatchProfileResponse(
        MatchSide side,
        String firstName,
        String avatarUrl,
        LocalDate birthDate,
        Integer age,
        BigDecimal heightCm,
        String fitnessGoal,
        String experienceLevel,
        List<String> missing,
        Details profile) {

    public record Details(
            String headline,
            String about,
            List<String> sports,
            List<String> goals,
            List<String> levels,
            List<String> availability,
            TrainingMode trainingMode,
            String city,
            Integer maxBudgetEur,
            Integer sessionRateEur,
            boolean visible) {

        public static Details from(MatchProfile profile) {
            return new Details(
                    profile.getHeadline(),
                    profile.getAbout(),
                    List.copyOf(profile.getSports()),
                    List.copyOf(profile.getGoals()),
                    List.copyOf(profile.getLevels()),
                    List.copyOf(profile.getAvailability()),
                    profile.getTrainingMode(),
                    profile.getCity(),
                    profile.getMaxBudgetEur(),
                    profile.getSessionRateEur(),
                    profile.isVisible());
        }
    }
}

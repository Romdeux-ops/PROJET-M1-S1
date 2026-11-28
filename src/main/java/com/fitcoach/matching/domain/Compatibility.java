package com.fitcoach.matching.domain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Score de compatibilite sportive entre un athlete et un coach, de 0 a 100,
 * symetrique : chacun voit le meme score sur la carte de l'autre.
 *
 * <p>Bareme : sports en commun 30, objectif de l'athlete pris en charge 20,
 * niveau pris en charge 10, creneaux communs 15, lieu 15, budget 10. Chaque
 * critere satisfait ajoute un code de raison stable, traduit par le frontend.
 */
public final class Compatibility {

    public static final String SHARED_SPORTS = "SHARED_SPORTS";
    public static final String GOAL_SUPPORTED = "GOAL_SUPPORTED";
    public static final String LEVEL_SUPPORTED = "LEVEL_SUPPORTED";
    public static final String SHARED_AVAILABILITY = "SHARED_AVAILABILITY";
    public static final String SAME_CITY = "SAME_CITY";
    public static final String REMOTE_POSSIBLE = "REMOTE_POSSIBLE";
    public static final String WITHIN_BUDGET = "WITHIN_BUDGET";

    public record Result(int score, List<String> reasons) {}

    private Compatibility() {}

    /**
     * @param athleteGoal objectif du compte de l'athlete ({@code fitness_goal})
     * @param athleteLevel niveau du compte de l'athlete ({@code experience_level})
     */
    public static Result between(MatchProfile athlete, String athleteGoal, String athleteLevel, MatchProfile coach) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        int sharedSports = intersection(athlete.getSports(), coach.getSports());
        if (sharedSports > 0) {
            score += sharedSports >= 2 ? 30 : 20;
            reasons.add(SHARED_SPORTS);
        }

        // Un coach sans preference d'objectif ou de niveau accepte tout le monde, sans s'y specialiser.
        if (coach.getGoals().contains(athleteGoal)) {
            score += 20;
            reasons.add(GOAL_SUPPORTED);
        } else if (coach.getGoals().isEmpty()) {
            score += 10;
        }
        if (coach.getLevels().contains(athleteLevel)) {
            score += 10;
            reasons.add(LEVEL_SUPPORTED);
        } else if (coach.getLevels().isEmpty()) {
            score += 5;
        }

        int sharedSlots = intersection(athlete.getAvailability(), coach.getAvailability());
        if (sharedSlots > 0) {
            score += Math.round(15f * sharedSlots / athlete.getAvailability().size());
            reasons.add(SHARED_AVAILABILITY);
        }

        if (athlete.getTrainingMode().allowsOnsite()
                && coach.getTrainingMode().allowsOnsite()
                && sameCity(athlete.getCity(), coach.getCity())) {
            score += 15;
            reasons.add(SAME_CITY);
        } else if (athlete.getTrainingMode().allowsRemote() && coach.getTrainingMode().allowsRemote()) {
            score += 10;
            reasons.add(REMOTE_POSSIBLE);
        }

        Integer budget = athlete.getMaxBudgetEur();
        Integer rate = coach.getSessionRateEur();
        if (budget == null || rate == null) {
            score += 5;
        } else if (rate <= budget) {
            score += 10;
            reasons.add(WITHIN_BUDGET);
        }

        return new Result(Math.min(score, 100), List.copyOf(reasons));
    }

    private static int intersection(Collection<String> a, Collection<String> b) {
        Set<String> shared = new HashSet<>(a);
        shared.retainAll(new HashSet<>(b));
        return shared.size();
    }

    private static boolean sameCity(String a, String b) {
        return a != null && b != null && !a.isBlank() && normalize(a).equals(normalize(b));
    }

    private static String normalize(String city) {
        return city.strip().toLowerCase(Locale.ROOT);
    }
}

package com.fitcoach.matching;

import static org.assertj.core.api.Assertions.assertThat;

import com.fitcoach.matching.domain.Compatibility;
import com.fitcoach.matching.domain.MatchProfile;
import com.fitcoach.matching.domain.MatchSide;
import com.fitcoach.matching.domain.TrainingMode;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** Bareme du score FitMatch, sans base de donnees. */
class CompatibilityTests {

    private static MatchProfile athlete() {
        MatchProfile p = new MatchProfile(UUID.randomUUID(), MatchSide.ATHLETE);
        p.setSports(List.of("STRENGTH", "RUNNING"));
        p.setAvailability(List.of("EVENING", "WEEKEND"));
        p.setTrainingMode(TrainingMode.ONSITE);
        p.setCity("Lyon");
        p.setMaxBudgetEur(30);
        return p;
    }

    private static MatchProfile coach() {
        MatchProfile p = new MatchProfile(UUID.randomUUID(), MatchSide.COACH);
        p.setSports(List.of("STRENGTH", "RUNNING"));
        p.setGoals(List.of("MUSCLE_GAIN"));
        p.setLevels(List.of("BEGINNER"));
        p.setAvailability(List.of("EVENING", "WEEKEND"));
        p.setTrainingMode(TrainingMode.BOTH);
        p.setCity("LYON");
        p.setSessionRateEur(30);
        return p;
    }

    @Test
    void aPerfectFitScoresOneHundred() {
        Compatibility.Result result = Compatibility.between(athlete(), "MUSCLE_GAIN", "BEGINNER", coach());

        assertThat(result.score()).isEqualTo(100);
        assertThat(result.reasons())
                .containsExactly(
                        Compatibility.SHARED_SPORTS,
                        Compatibility.GOAL_SUPPORTED,
                        Compatibility.LEVEL_SUPPORTED,
                        Compatibility.SHARED_AVAILABILITY,
                        Compatibility.SAME_CITY,
                        Compatibility.WITHIN_BUDGET);
    }

    @Test
    void nothingInCommonScoresZero() {
        MatchProfile coach = coach();
        coach.setSports(List.of("YOGA"));
        coach.setAvailability(List.of("MORNING"));
        coach.setTrainingMode(TrainingMode.ONSITE);
        coach.setCity("Paris");
        coach.setSessionRateEur(90);

        Compatibility.Result result = Compatibility.between(athlete(), "ENDURANCE", "ADVANCED", coach);

        assertThat(result.score()).isZero();
        assertThat(result.reasons()).isEmpty();
    }

    @Test
    void partialMatchesArePartiallyRewarded() {
        MatchProfile athlete = athlete();
        athlete.setTrainingMode(TrainingMode.BOTH);
        athlete.setCity("Marseille");
        athlete.setMaxBudgetEur(null);
        MatchProfile coach = coach();
        coach.setSports(List.of("RUNNING"));
        coach.setGoals(List.of());
        coach.setLevels(List.of());
        coach.setAvailability(List.of("EVENING"));

        Compatibility.Result result = Compatibility.between(athlete, "ENDURANCE", "ADVANCED", coach);

        // 20 (un sport) + 10 (sans preference d'objectif) + 5 (sans preference de niveau)
        // + 8 (un creneau sur deux) + 10 (a distance) + 5 (budget inconnu)
        assertThat(result.score()).isEqualTo(58);
        assertThat(result.reasons())
                .containsExactly(
                        Compatibility.SHARED_SPORTS,
                        Compatibility.SHARED_AVAILABILITY,
                        Compatibility.REMOTE_POSSIBLE);
    }
}

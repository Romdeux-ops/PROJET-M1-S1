package com.fitcoach.stats.service;

import com.fitcoach.stats.dto.ExerciseProgressionPoint;
import com.fitcoach.stats.dto.MuscleVolumeShare;
import com.fitcoach.stats.dto.ProgressionScoreResponse;
import com.fitcoach.stats.dto.StatsOverviewResponse;
import com.fitcoach.stats.dto.StreakResponse;
import com.fitcoach.stats.dto.WeeklyActivityPoint;
import com.fitcoach.stats.dto.WeeklyAdherencePoint;
import com.fitcoach.stats.dto.WeeklyVolumePoint;
import com.fitcoach.stats.repository.StatsQueries;
import com.fitcoach.stats.repository.StatsQueries.DailyActivity;
import com.fitcoach.stats.repository.StatsQueries.VolumeComparison;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private static final int MAX_WEEKS = 104;
    private static final int MAX_DAYS = 365;
    private static final int ACTIVITY_DAYS = 7;
    private static final int SCORE_WINDOW_DAYS = 30;
    /** Au-dela, une serie ininterrompue est de toute facon hors de l'echelle affichee. */
    private static final int STREAK_LOOKUP_DAYS = 400;

    private final StatsQueries statsQueries;
    private final Clock clock;

    public StatsService(StatsQueries statsQueries, Clock clock) {
        this.statsQueries = statsQueries;
        this.clock = clock;
    }

    public StatsOverviewResponse overview(UUID athleteId) {
        ZoneId zone = clock.getZone();
        LocalDate today = LocalDate.now(clock);
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate previousWeekStart = weekStart.minusWeeks(1);
        LocalDate activityStart = today.minusDays(ACTIVITY_DAYS - 1L);
        LocalDate from = previousWeekStart.isBefore(activityStart) ? previousWeekStart : activityStart;

        Map<LocalDate, DailyActivity> byDay = statsQueries.dailyActivity(athleteId, zone, from, today).stream()
                .collect(Collectors.toMap(DailyActivity::date, d -> d));
        Collection<DailyActivity> days = byDay.values();

        int sessionsThisWeek = sum(days, weekStart, today, DailyActivity::sessions);
        int sessionsLastWeek = sum(days, previousWeekStart, weekStart.minusDays(1), DailyActivity::sessions);
        int minutesThisWeek = sum(days, weekStart, today, DailyActivity::minutes);
        int minutesLastWeek = sum(days, previousWeekStart, weekStart.minusDays(1), DailyActivity::minutes);

        List<WeeklyActivityPoint> weeklyActivity = activityStart
                .datesUntil(today.plusDays(1))
                .map(date -> new WeeklyActivityPoint(
                        date, byDay.containsKey(date) ? byDay.get(date).minutes() : 0))
                .toList();

        return new StatsOverviewResponse(
                sessionsThisWeek,
                trendPercent(sessionsThisWeek, sessionsLastWeek),
                minutesThisWeek,
                trendPercent(minutesThisWeek, minutesLastWeek),
                streak(athleteId).currentStreakDays(),
                statsQueries.averageRpe(athleteId, zone, weekStart, today),
                weeklyActivity);
    }

    public List<ExerciseProgressionPoint> exerciseProgression(UUID athleteId, UUID exerciseId) {
        return statsQueries.exerciseProgression(athleteId, exerciseId, clock.getZone());
    }

    public List<WeeklyVolumePoint> weeklyVolume(UUID athleteId, int weeks) {
        LocalDate today = LocalDate.now(clock);
        LocalDate from = today.minusWeeks(Math.clamp(weeks, 1, MAX_WEEKS));
        return statsQueries.weeklyVolume(athleteId, clock.getZone(), from, today);
    }

    public StreakResponse streak(UUID athleteId) {
        List<LocalDate> days = statsQueries.recentTrainingDays(athleteId, clock.getZone(), STREAK_LOOKUP_DAYS);
        LocalDate today = LocalDate.now(clock);
        // La serie reste en cours tant que la veille est couverte.
        LocalDate expected = !days.isEmpty() && days.get(0).equals(today) ? today : today.minusDays(1);
        int streak = 0;
        for (LocalDate day : days) {
            if (!day.equals(expected)) {
                break;
            }
            streak++;
            expected = expected.minusDays(1);
        }
        return new StreakResponse(streak);
    }

    public List<WeeklyAdherencePoint> weeklyAdherence(UUID athleteId, int weeks) {
        LocalDate today = LocalDate.now(clock);
        return statsQueries.weeklyAdherence(athleteId, today.minusWeeks(Math.clamp(weeks, 1, MAX_WEEKS)), today);
    }

    public List<MuscleVolumeShare> muscleDistribution(UUID athleteId, int days) {
        LocalDate today = LocalDate.now(clock);
        return statsQueries.primaryMuscleVolume(
                athleteId, clock.getZone(), today.minusDays(Math.clamp(days, 1, MAX_DAYS)), today);
    }

    /** Volume des 30 derniers jours (aujourd'hui inclus) contre les 30 jours precedents. */
    public ProgressionScoreResponse progressionScore(UUID athleteId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate recentFrom = today.minusDays(SCORE_WINDOW_DAYS);
        LocalDate previousFrom = recentFrom.minusDays(SCORE_WINDOW_DAYS);
        VolumeComparison volumes =
                statsQueries.volumeComparison(athleteId, clock.getZone(), previousFrom, recentFrom, today);

        BigDecimal changePercent;
        if (volumes.previous().signum() == 0) {
            changePercent = volumes.recent().signum() > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        } else {
            changePercent = volumes.recent()
                    .subtract(volumes.previous())
                    .divide(volumes.previous(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return new ProgressionScoreResponse(volumes.recent(), volumes.previous(), changePercent);
    }

    private static int sum(Collection<DailyActivity> days, LocalDate from, LocalDate to, ToIntFunction<DailyActivity> value) {
        return days.stream()
                .filter(d -> !d.date().isBefore(from) && !d.date().isAfter(to))
                .mapToInt(value)
                .sum();
    }

    private static int trendPercent(int current, int previous) {
        if (previous == 0) {
            return current > 0 ? 100 : 0;
        }
        return (int) Math.round(((current - previous) / (double) previous) * 100);
    }
}

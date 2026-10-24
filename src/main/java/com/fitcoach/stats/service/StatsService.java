package com.fitcoach.stats.service;

import com.fitcoach.catalog.domain.ExerciseMuscle;
import com.fitcoach.catalog.domain.MuscleGroup;
import com.fitcoach.catalog.domain.MuscleRole;
import com.fitcoach.catalog.repository.ExerciseMuscleRepository;
import com.fitcoach.catalog.repository.MuscleGroupRepository;
import com.fitcoach.planning.domain.ScheduledSession;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import com.fitcoach.planning.repository.ScheduledSessionRepository;
import com.fitcoach.stats.dto.ExerciseProgressionPoint;
import com.fitcoach.stats.dto.MuscleVolumeShare;
import com.fitcoach.stats.dto.ProgressionScoreResponse;
import com.fitcoach.stats.dto.StatsOverviewResponse;
import com.fitcoach.stats.dto.StreakResponse;
import com.fitcoach.stats.dto.WeeklyActivityPoint;
import com.fitcoach.stats.dto.WeeklyAdherencePoint;
import com.fitcoach.stats.dto.WeeklyVolumePoint;
import com.fitcoach.training.domain.SessionSet;
import com.fitcoach.training.domain.WorkoutSession;
import com.fitcoach.training.repository.SessionSetRepository;
import com.fitcoach.training.repository.WorkoutSessionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final SessionSetRepository sessionSetRepository;
    private final ScheduledSessionRepository scheduledSessionRepository;
    private final ExerciseMuscleRepository exerciseMuscleRepository;
    private final MuscleGroupRepository muscleGroupRepository;

    public StatsService(
            WorkoutSessionRepository workoutSessionRepository,
            SessionSetRepository sessionSetRepository,
            ScheduledSessionRepository scheduledSessionRepository,
            ExerciseMuscleRepository exerciseMuscleRepository,
            MuscleGroupRepository muscleGroupRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.sessionSetRepository = sessionSetRepository;
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.exerciseMuscleRepository = exerciseMuscleRepository;
        this.muscleGroupRepository = muscleGroupRepository;
    }

    public StatsOverviewResponse overview(UUID athleteId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = weekStartOf(today);
        LocalDate previousWeekStart = weekStart.minusWeeks(1);

        List<WorkoutSession> sessions = workoutSessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId);

        List<WorkoutSession> thisWeek =
                sessions.stream().filter(s -> !toLocalDate(s.getPerformedAt()).isBefore(weekStart)).toList();
        List<WorkoutSession> lastWeek = sessions.stream()
                .filter(s -> {
                    LocalDate d = toLocalDate(s.getPerformedAt());
                    return !d.isBefore(previousWeekStart) && d.isBefore(weekStart);
                })
                .toList();

        int minutesThisWeek = thisWeek.stream().mapToInt(s -> s.getDurationMinutes() == null ? 0 : s.getDurationMinutes()).sum();
        int minutesLastWeek = lastWeek.stream().mapToInt(s -> s.getDurationMinutes() == null ? 0 : s.getDurationMinutes()).sum();

        List<UUID> thisWeekSessionIds = thisWeek.stream().map(WorkoutSession::getId).toList();
        List<SessionSet> thisWeekSets = sessionSetRepository.findBySessionIdIn(thisWeekSessionIds);
        double averageEffort = thisWeekSets.stream()
                .map(SessionSet::getRpe)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);

        List<WeeklyActivityPoint> weeklyActivity = java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(i -> today.minusDays(6L - i))
                .map(date -> new WeeklyActivityPoint(
                        date,
                        sessions.stream()
                                .filter(s -> toLocalDate(s.getPerformedAt()).equals(date))
                                .mapToInt(s -> s.getDurationMinutes() == null ? 0 : s.getDurationMinutes())
                                .sum()))
                .toList();

        return new StatsOverviewResponse(
                thisWeek.size(),
                trendPercent(thisWeek.size(), lastWeek.size()),
                minutesThisWeek,
                trendPercent(minutesThisWeek, minutesLastWeek),
                streak(athleteId).currentStreakDays(),
                averageEffort,
                weeklyActivity);
    }

    private int trendPercent(int current, int previous) {
        if (previous == 0) {
            return current > 0 ? 100 : 0;
        }
        return (int) Math.round(((current - previous) / (double) previous) * 100);
    }

    public List<ExerciseProgressionPoint> exerciseProgression(UUID athleteId, UUID exerciseId) {
        Map<UUID, LocalDate> dateBySessionId = sessionDatesOf(athleteId);
        List<SessionSet> sets = sessionSetRepository.findByExerciseIdAndSessionIdIn(
                exerciseId, List.copyOf(dateBySessionId.keySet()));

        Map<LocalDate, List<SessionSet>> byDate =
                sets.stream().collect(Collectors.groupingBy(s -> dateBySessionId.get(s.getSessionId())));

        return byDate.entrySet().stream()
                .map(entry -> {
                    BigDecimal maxWeight = entry.getValue().stream()
                            .map(SessionSet::getWeightKg)
                            .max(BigDecimal::compareTo)
                            .orElse(BigDecimal.ZERO);
                    BigDecimal maxEst1Rm = entry.getValue().stream()
                            .map(SessionSet::estimated1Rm)
                            .max(BigDecimal::compareTo)
                            .orElse(BigDecimal.ZERO);
                    return new ExerciseProgressionPoint(entry.getKey(), maxWeight, maxEst1Rm);
                })
                .sorted(Comparator.comparing(ExerciseProgressionPoint::date))
                .toList();
    }

    public List<WeeklyVolumePoint> weeklyVolume(UUID athleteId, int weeks) {
        Map<UUID, LocalDate> dateBySessionId = sessionDatesOf(athleteId);
        List<SessionSet> sets = sessionSetRepository.findBySessionIdIn(List.copyOf(dateBySessionId.keySet()));

        LocalDate cutoff = LocalDate.now().minusWeeks(weeks);
        Map<LocalDate, BigDecimal> volumeByWeek = sets.stream()
                .filter(s -> !dateBySessionId.get(s.getSessionId()).isBefore(cutoff))
                .collect(Collectors.groupingBy(
                        s -> weekStartOf(dateBySessionId.get(s.getSessionId())),
                        Collectors.reducing(BigDecimal.ZERO, SessionSet::volume, BigDecimal::add)));

        return volumeByWeek.entrySet().stream()
                .map(e -> new WeeklyVolumePoint(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(WeeklyVolumePoint::weekStart))
                .toList();
    }

    public StreakResponse streak(UUID athleteId) {
        List<LocalDate> dates = workoutSessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId).stream()
                .map(s -> toLocalDate(s.getPerformedAt()))
                .distinct()
                .sorted(Comparator.reverseOrder())
                .toList();

        if (dates.isEmpty()) {
            return new StreakResponse(0);
        }

        LocalDate today = LocalDate.now();
        LocalDate expected = dates.get(0).equals(today) ? today : today.minusDays(1);
        if (!dates.get(0).equals(expected)) {
            return new StreakResponse(0);
        }

        int streak = 0;
        for (LocalDate date : dates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }
        return new StreakResponse(streak);
    }

    public List<WeeklyAdherencePoint> weeklyAdherence(UUID athleteId, int weeks) {
        LocalDate cutoff = LocalDate.now().minusWeeks(weeks);
        List<ScheduledSession> sessions = scheduledSessionRepository
                .findByAthleteIdAndScheduledDateBetweenOrderByScheduledDate(athleteId, cutoff, LocalDate.now());

        Map<LocalDate, List<ScheduledSession>> byWeek =
                sessions.stream().collect(Collectors.groupingBy(s -> weekStartOf(s.getScheduledDate())));

        return byWeek.entrySet().stream()
                .map(e -> new WeeklyAdherencePoint(
                        e.getKey(),
                        e.getValue().size(),
                        (int) e.getValue().stream().filter(s -> s.getStatus() == ScheduledSessionStatus.DONE).count(),
                        (int) e.getValue().stream()
                                .filter(s -> s.getStatus() == ScheduledSessionStatus.SKIPPED)
                                .count()))
                .sorted(Comparator.comparing(WeeklyAdherencePoint::weekStart))
                .toList();
    }

    public List<MuscleVolumeShare> muscleDistribution(UUID athleteId, int days) {
        LocalDate cutoff = LocalDate.now().minusDays(days);
        Map<UUID, LocalDate> dateBySessionId = sessionDatesOf(athleteId);
        List<UUID> recentSessionIds =
                dateBySessionId.entrySet().stream().filter(e -> !e.getValue().isBefore(cutoff)).map(Map.Entry::getKey).toList();
        List<SessionSet> sets = sessionSetRepository.findBySessionIdIn(recentSessionIds);

        Map<UUID, MuscleGroup> muscleGroupsById =
                muscleGroupRepository.findAll().stream().collect(Collectors.toMap(MuscleGroup::getId, m -> m));

        Map<UUID, BigDecimal> volumeByMuscleGroup = new java.util.HashMap<>();
        for (SessionSet set : sets) {
            List<ExerciseMuscle> muscles = exerciseMuscleRepository.findByExerciseId(set.getExerciseId());
            for (ExerciseMuscle muscle : muscles) {
                if (muscle.getRole() != MuscleRole.PRIMARY) {
                    continue;
                }
                volumeByMuscleGroup.merge(muscle.getMuscleGroupId(), set.volume(), BigDecimal::add);
            }
        }

        return volumeByMuscleGroup.entrySet().stream()
                .map(e -> {
                    MuscleGroup group = muscleGroupsById.get(e.getKey());
                    return new MuscleVolumeShare(group.getId(), group.getCode(), group.getName(), e.getValue());
                })
                .sorted(Comparator.comparing(MuscleVolumeShare::volume).reversed())
                .toList();
    }

    public ProgressionScoreResponse progressionScore(UUID athleteId) {
        Map<UUID, LocalDate> dateBySessionId = sessionDatesOf(athleteId);
        List<SessionSet> sets = sessionSetRepository.findBySessionIdIn(List.copyOf(dateBySessionId.keySet()));

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);
        LocalDate sixtyDaysAgo = today.minusDays(60);

        BigDecimal last30 = sumVolume(sets, dateBySessionId, thirtyDaysAgo, today);
        BigDecimal previous30 = sumVolume(sets, dateBySessionId, sixtyDaysAgo, thirtyDaysAgo.minusDays(1));

        BigDecimal changePercent;
        if (previous30.compareTo(BigDecimal.ZERO) == 0) {
            changePercent = last30.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        } else {
            changePercent = last30.subtract(previous30)
                    .divide(previous30, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        return new ProgressionScoreResponse(last30, previous30, changePercent);
    }

    private BigDecimal sumVolume(List<SessionSet> sets, Map<UUID, LocalDate> dateBySessionId, LocalDate from, LocalDate to) {
        return sets.stream()
                .filter(s -> {
                    LocalDate date = dateBySessionId.get(s.getSessionId());
                    return !date.isBefore(from) && !date.isAfter(to);
                })
                .map(SessionSet::volume)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<UUID, LocalDate> sessionDatesOf(UUID athleteId) {
        return workoutSessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId).stream()
                .collect(Collectors.toMap(WorkoutSession::getId, s -> toLocalDate(s.getPerformedAt())));
    }

    private LocalDate toLocalDate(Instant instant) {
        return instant.atZone(ZoneOffset.UTC).toLocalDate();
    }

    private LocalDate weekStartOf(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}

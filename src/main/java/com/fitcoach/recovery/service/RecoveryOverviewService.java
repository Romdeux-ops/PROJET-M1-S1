package com.fitcoach.recovery.service;

import com.fitcoach.identity.api.AthleteWeight;
import com.fitcoach.planning.api.AthletePlanning;

import com.fitcoach.recovery.domain.RecoveryDataStatus;
import com.fitcoach.recovery.dto.RecoveryAssessmentResponse;
import com.fitcoach.recovery.dto.RecoveryCheckinResponse;
import com.fitcoach.recovery.dto.RecoveryDailyTrendResponse;
import com.fitcoach.recovery.dto.RecoveryOverviewResponse;
import com.fitcoach.recovery.dto.RecoveryPlanningSummaryResponse;
import com.fitcoach.recovery.dto.RecoverySettingsResponse;
import com.fitcoach.recovery.dto.RecoveryTrainingSummaryResponse;
import com.fitcoach.recovery.dto.RecoveryWeeklySummaryResponse;
import com.fitcoach.recovery.dto.RecoveryWeightSummaryResponse;
import com.fitcoach.recovery.dto.SleepLogResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service d'agregation des donnees du tableau
 * de bord de recuperation.
 *
 * Les donnees proviennent des services Recovery
 * et des interfaces publiques Identity et Planning.
 */
@Service
@Transactional(readOnly = true)
public class RecoveryOverviewService {

    private static final int HISTORY_DAYS = 30;

    private static final int DECIMAL_SCALE = 2;

    private static final BigDecimal ONE_HUNDRED =
            BigDecimal.valueOf(100);

    private final RecoveryAssessmentService assessmentService;

    private final RecoveryTrainingService trainingService;

    private final SleepLogService sleepLogService;

    private final RecoveryCheckinService checkinService;

    private final RecoverySettingsService settingsService;

    private final AthleteWeight athleteWeight;

    private final AthletePlanning athletePlanning;

    private final Clock clock;

    public RecoveryOverviewService(
            RecoveryAssessmentService assessmentService,
            RecoveryTrainingService trainingService,
            SleepLogService sleepLogService,
            RecoveryCheckinService checkinService,
            RecoverySettingsService settingsService,
            AthleteWeight athleteWeight,
            AthletePlanning athletePlanning,
            Clock clock
    ) {

        this.assessmentService = assessmentService;
        this.trainingService = trainingService;
        this.sleepLogService = sleepLogService;
        this.checkinService = checkinService;
        this.settingsService = settingsService;
        this.athleteWeight = athleteWeight;
        this.athletePlanning = athletePlanning;
        this.clock = clock;
    }

    // ==========================================
    // Tableau de bord
    // ==========================================

    public RecoveryOverviewResponse getOverview(
            UUID userId
    ) {

        LocalDate today = LocalDate.now(clock);

        LocalDate historyStart =
                today.minusDays(HISTORY_DAYS - 1);

        LocalDate weekStart = today.with(
                TemporalAdjusters.previousOrSame(
                        DayOfWeek.MONDAY
                )
        );

        LocalDate weekEnd = weekStart.plusDays(6);

        // ======================================
        // Recuperation des donnees
        // ======================================

        List<RecoveryAssessmentResponse> assessments =
                assessmentService.getHistory(
                        userId,
                        historyStart,
                        today
                );

        List<SleepLogResponse> sleepLogs =
                sleepLogService.getSleepLogs(
                        userId,
                        historyStart,
                        today
                );

        List<RecoveryCheckinResponse> checkins =
                checkinService.getCheckins(
                        userId,
                        historyStart,
                        today
                );

        List<RecoveryTrainingSummaryResponse> training =
                trainingService.getDailySummaries(
                        userId,
                        historyStart,
                        today
                );

        RecoverySettingsResponse settings =
                settingsService.getSettings(userId);

        // ======================================
        // Indexation par date
        // ======================================

        Map<LocalDate, RecoveryAssessmentResponse>
                assessmentsByDate = assessments.stream()
                .collect(Collectors.toMap(
                        RecoveryAssessmentResponse::assessmentDate,
                        Function.identity()
                ));

        Map<LocalDate, SleepLogResponse>
                sleepByDate = sleepLogs.stream()
                .collect(Collectors.toMap(
                        SleepLogResponse::sleepDate,
                        Function.identity()
                ));

        Map<LocalDate, RecoveryCheckinResponse>
                checkinsByDate = checkins.stream()
                .collect(Collectors.toMap(
                        RecoveryCheckinResponse::checkinDate,
                        Function.identity()
                ));

        Map<LocalDate, RecoveryTrainingSummaryResponse>
                trainingByDate = training.stream()
                .collect(Collectors.toMap(
                        RecoveryTrainingSummaryResponse::date,
                        Function.identity()
                ));

        // ======================================
        // Graphiques quotidiens
        // ======================================

        List<RecoveryDailyTrendResponse> dailyTrends =
                new ArrayList<>();

        for (
                LocalDate date = historyStart;
                !date.isAfter(today);
                date = date.plusDays(1)
        ) {

            dailyTrends.add(
                    buildDailyTrend(
                            date,
                            assessmentsByDate.get(date),
                            sleepByDate.get(date),
                            checkinsByDate.get(date),
                            trainingByDate.get(date)
                    )
            );
        }

        // ======================================
        // Synthese hebdomadaire
        // ======================================

        RecoveryWeeklySummaryResponse weeklySummary =
                buildWeeklySummary(
                        userId,
                        weekStart,
                        weekEnd,
                        today,
                        assessments,
                        sleepLogs,
                        checkins,
                        training
                );

        // ======================================
        // Evolution du poids
        // ======================================

        RecoveryWeightSummaryResponse weightSummary =
                buildWeightSummary(
                        userId,
                        historyStart,
                        today
                );

        // ======================================
        // Reponse finale
        // ======================================

        return new RecoveryOverviewResponse(
                today,
                Instant.now(clock),
                clock.getZone().getId(),

                assessmentsByDate.get(today),
                sleepByDate.get(today),
                checkinsByDate.get(today),
                trainingByDate.get(today),

                settings,
                weeklySummary,
                weightSummary,
                dailyTrends
        );
    }

    // ==========================================
    // Actualisation explicite du tableau de bord
    // ==========================================

    /**
     * Recalcule les evaluations recentes avant
     * de retourner le tableau de bord.
     *
     * Permet notamment de prendre en compte
     * les modifications provenant directement
     * de Training ou Identity.
     */
    @Transactional
    public RecoveryOverviewResponse refreshOverview(
            UUID userId
    ) {

        LocalDate today = LocalDate.now(clock);

        LocalDate from =
                today.minusDays(HISTORY_DAYS - 1);

        assessmentService.recalculateRange(
                userId,
                from,
                today
        );

        return getOverview(userId);
    }

    // ==========================================
    // Donnees quotidiennes
    // ==========================================

    private RecoveryDailyTrendResponse buildDailyTrend(
            LocalDate date,
            RecoveryAssessmentResponse assessment,
            SleepLogResponse sleep,
            RecoveryCheckinResponse checkin,
            RecoveryTrainingSummaryResponse training
    ) {

        return new RecoveryDailyTrendResponse(

                date,

                // Scores
                assessment == null
                        ? null
                        : assessment.sleepScore(),

                assessment == null
                        ? null
                        : assessment.bodyBattery(),

                assessment == null
                        ? null
                        : assessment.trainingReadiness(),

                // Sommeil
                sleep == null
                        ? null
                        : sleep.estimatedSleepMinutes(),

                sleep == null
                        ? null
                        : sleep.sleepQuality(),

                sleep == null
                        ? null
                        : sleep.sleepDurationApproximate(),

                // Questionnaire
                checkin == null
                        ? null
                        : checkin.energyLevel(),

                checkin == null
                        ? null
                        : checkin.fatigueLevel(),

                checkin == null
                        ? null
                        : checkin.stressLevel(),

                checkin == null
                        ? null
                        : checkin.muscleSoreness(),

                // Activite sportive
                training == null
                        ? 0
                        : training.totalSessions(),

                training == null
                        ? 0L
                        : training.recordedDurationMinutes(),

                training == null
                        ? null
                        : training.trainingLoad(),

                training == null
                        ? null
                        : training.activeCaloriesKcal(),

                // Qualite des donnees de recuperation
                assessment == null
                        ? RecoveryDataStatus.INSUFFICIENT
                        : assessment.dataStatus()
        );
    }

    // ==========================================
    // Synthese hebdomadaire
    // ==========================================

    private RecoveryWeeklySummaryResponse buildWeeklySummary(
            UUID userId,
            LocalDate weekStart,
            LocalDate weekEnd,
            LocalDate today,
            List<RecoveryAssessmentResponse> assessments,
            List<SleepLogResponse> sleepLogs,
            List<RecoveryCheckinResponse> checkins,
            List<RecoveryTrainingSummaryResponse> training
    ) {

        int elapsedDays = Math.toIntExact(
                ChronoUnit.DAYS.between(
                        weekStart,
                        today
                ) + 1
        );

        List<RecoveryAssessmentResponse> weeklyAssessments =
                assessments.stream()
                        .filter(assessment ->
                                isWithin(
                                        assessment.assessmentDate(),
                                        weekStart,
                                        today
                                )
                        )
                        .toList();

        List<SleepLogResponse> weeklySleep =
                sleepLogs.stream()
                        .filter(sleep ->
                                isWithin(
                                        sleep.sleepDate(),
                                        weekStart,
                                        today
                                )
                        )
                        .toList();

        List<RecoveryCheckinResponse> weeklyCheckins =
                checkins.stream()
                        .filter(checkin ->
                                isWithin(
                                        checkin.checkinDate(),
                                        weekStart,
                                        today
                                )
                        )
                        .toList();

        List<RecoveryTrainingSummaryResponse> weeklyTraining =
                training.stream()
                        .filter(summary ->
                                isWithin(
                                        summary.date(),
                                        weekStart,
                                        today
                                )
                        )
                        .toList();

        // ======================================
        // Statistiques sportives
        // ======================================

        int workoutCount = weeklyTraining.stream()
                .mapToInt(
                        RecoveryTrainingSummaryResponse::totalSessions
                )
                .sum();

        int trainingDays = (int) weeklyTraining.stream()
                .filter(summary ->
                        summary.totalSessions() > 0
                )
                .count();

        int daysWithoutRecordedTraining =
                elapsedDays - trainingDays;

        long recordedDurationMinutes =
                weeklyTraining.stream()
                        .mapToLong(
                                RecoveryTrainingSummaryResponse
                                        ::recordedDurationMinutes
                        )
                        .sum();

        int sessionsWithDuration =
                weeklyTraining.stream()
                        .mapToInt(
                                RecoveryTrainingSummaryResponse
                                        ::sessionsWithDuration
                        )
                        .sum();

        int sessionsWithTrainingLoad =
                weeklyTraining.stream()
                        .mapToInt(
                                RecoveryTrainingSummaryResponse
                                        ::sessionsWithTrainingLoad
                        )
                        .sum();

        int sessionsWithCalories =
                weeklyTraining.stream()
                        .mapToInt(
                                RecoveryTrainingSummaryResponse
                                        ::sessionsWithCalories
                        )
                        .sum();

        int sessionsWithEstimatedRpe =
                weeklyTraining.stream()
                        .mapToInt(
                                RecoveryTrainingSummaryResponse
                                        ::sessionsWithEstimatedRpe
                        )
                        .sum();

        boolean durationComplete =
                workoutCount == sessionsWithDuration;

        boolean trainingLoadComplete =
                workoutCount == sessionsWithTrainingLoad;

        boolean caloriesComplete =
                workoutCount == sessionsWithCalories;

        BigDecimal knownTrainingLoad =
                weeklyTraining.stream()
                        .map(
                                RecoveryTrainingSummaryResponse
                                        ::knownTrainingLoad
                        )
                        .filter(Objects::nonNull)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                DECIMAL_SCALE,
                                RoundingMode.HALF_UP
                        );

        BigDecimal knownActiveCalories =
                weeklyTraining.stream()
                        .map(
                                RecoveryTrainingSummaryResponse
                                        ::knownActiveCaloriesKcal
                        )
                        .filter(Objects::nonNull)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                DECIMAL_SCALE,
                                RoundingMode.HALF_UP
                        );

        BigDecimal totalTrainingLoad =
                trainingLoadComplete
                        ? knownTrainingLoad
                        : null;

        BigDecimal totalActiveCalories =
                caloriesComplete
                        ? knownActiveCalories
                        : null;

        // ======================================
        // Statistiques du sommeil
        // ======================================

        int sleepLogsCount = weeklySleep.size();

        int approximateSleepLogsCount =
                (int) weeklySleep.stream()
                        .filter(
                                SleepLogResponse
                                        ::sleepDurationApproximate
                        )
                        .count();

        BigDecimal averageSleepMinutes = average(
                weeklySleep,
                SleepLogResponse::estimatedSleepMinutes
        );

        BigDecimal averageSleepQuality = average(
                weeklySleep,
                SleepLogResponse::sleepQuality
        );

        // ======================================
        // Moyennes des scores
        // ======================================

        BigDecimal averageSleepScore = average(
                weeklyAssessments,
                RecoveryAssessmentResponse::sleepScore
        );

        BigDecimal averageBodyBattery = average(
                weeklyAssessments,
                RecoveryAssessmentResponse::bodyBattery
        );

        BigDecimal averageTrainingReadiness = average(
                weeklyAssessments,
                RecoveryAssessmentResponse::trainingReadiness
        );

        int daysWithSleepScore =
                countAvailable(
                        weeklyAssessments,
                        RecoveryAssessmentResponse::sleepScore
                );

        int daysWithBodyBattery =
                countAvailable(
                        weeklyAssessments,
                        RecoveryAssessmentResponse::bodyBattery
                );

        int daysWithTrainingReadiness =
                countAvailable(
                        weeklyAssessments,
                        RecoveryAssessmentResponse::trainingReadiness
                );

        // ======================================
        // Moyennes des questionnaires
        // ======================================

        BigDecimal averageEnergyLevel = average(
                weeklyCheckins,
                RecoveryCheckinResponse::energyLevel
        );

        BigDecimal averageFatigueLevel = average(
                weeklyCheckins,
                RecoveryCheckinResponse::fatigueLevel
        );

        BigDecimal averageStressLevel = average(
                weeklyCheckins,
                RecoveryCheckinResponse::stressLevel
        );

        BigDecimal averageMuscleSoreness = average(
                weeklyCheckins,
                RecoveryCheckinResponse::muscleSoreness
        );

        // ======================================
        // Respect du planning
        // ======================================

        RecoveryPlanningSummaryResponse planning =
                buildPlanningSummary(
                        userId,
                        weekStart,
                        weekEnd,
                        today
                );

        return new RecoveryWeeklySummaryResponse(

                weekStart,
                weekEnd,
                today,
                elapsedDays,

                workoutCount,
                trainingDays,
                daysWithoutRecordedTraining,

                recordedDurationMinutes,

                totalTrainingLoad,
                totalActiveCalories,

                knownTrainingLoad,
                knownActiveCalories,

                sessionsWithDuration,
                sessionsWithTrainingLoad,
                sessionsWithCalories,
                sessionsWithEstimatedRpe,

                durationComplete,
                trainingLoadComplete,
                caloriesComplete,

                sleepLogsCount,
                approximateSleepLogsCount,
                averageSleepMinutes,
                averageSleepQuality,

                averageSleepScore,
                averageBodyBattery,
                averageTrainingReadiness,

                daysWithSleepScore,
                daysWithBodyBattery,
                daysWithTrainingReadiness,

                weeklyCheckins.size(),
                averageEnergyLevel,
                averageFatigueLevel,
                averageStressLevel,
                averageMuscleSoreness,

                planning
        );
    }

    // ==========================================
    // Respect du planning sportif
    // ==========================================

    private RecoveryPlanningSummaryResponse buildPlanningSummary(
            UUID userId,
            LocalDate weekStart,
            LocalDate weekEnd,
            LocalDate today
    ) {

        List<AthletePlanning.HistoricalSession> sessions =
                athletePlanning.history(
                        userId,
                        weekStart,
                        weekEnd
                );

        int totalScheduledSessions = sessions.size();

        int elapsedScheduledSessions = 0;

        int completedSessions = 0;

        int pendingValidationSessions = 0;

        int skippedSessions = 0;

        int unconfirmedSessions = 0;

        int futureScheduledSessions = 0;

        for (AthletePlanning.HistoricalSession session
                : sessions) {

            if (session.scheduledDate().isAfter(today)) {

                futureScheduledSessions++;

                continue;
            }

            elapsedScheduledSessions++;

            switch (session.status()) {

                case DONE -> completedSessions++;

                case PENDING_VALIDATION ->
                        pendingValidationSessions++;

                case SKIPPED -> skippedSessions++;

                case PLANNED -> unconfirmedSessions++;
            }
        }

        int declaredCompletedSessions =
                completedSessions
                        + pendingValidationSessions;

        BigDecimal adherencePercentage = percentage(
                declaredCompletedSessions,
                elapsedScheduledSessions
        );

        return new RecoveryPlanningSummaryResponse(

                totalScheduledSessions,

                elapsedScheduledSessions,

                completedSessions,

                pendingValidationSessions,

                skippedSessions,

                unconfirmedSessions,

                futureScheduledSessions,

                declaredCompletedSessions,

                adherencePercentage
        );
    }

    // ==========================================
    // Evolution du poids
    // ==========================================

    private RecoveryWeightSummaryResponse buildWeightSummary(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        AthleteWeight.Measurement current =
                athleteWeight.weightAt(userId, to)
                        .orElse(null);

        List<AthleteWeight.Measurement> measurements =
                athleteWeight.weightHistory(
                        userId,
                        from,
                        to
                )
                .stream()
                .sorted(
                        java.util.Comparator.comparing(
                                AthleteWeight.Measurement::measuredOn
                        )
                )
                .toList();

        AthleteWeight.Measurement reference =
                athleteWeight.weightAt(userId, from)
                        .orElse(null);

        if (reference == null && !measurements.isEmpty()) {

            reference = measurements.getFirst();
        }

        List<RecoveryWeightSummaryResponse.WeightPoint>
                history = measurements.stream()
                .map(measurement ->
                        new RecoveryWeightSummaryResponse.WeightPoint(
                                measurement.measuredOn(),
                                measurement.weightKg()
                        )
                )
                .toList();

        BigDecimal weightChangeKg = null;

        BigDecimal weightChangePercentage = null;

        if (current != null &&
                reference != null &&
                current.measuredOn().isAfter(
                        reference.measuredOn()
                )) {

            weightChangeKg =
                    current.weightKg()
                            .subtract(reference.weightKg())
                            .setScale(
                                    DECIMAL_SCALE,
                                    RoundingMode.HALF_UP
                            );

            if (reference.weightKg().signum() > 0) {

                weightChangePercentage =
                        weightChangeKg
                                .multiply(ONE_HUNDRED)
                                .divide(
                                        reference.weightKg(),
                                        DECIMAL_SCALE,
                                        RoundingMode.HALF_UP
                                );
            }
        }

        return new RecoveryWeightSummaryResponse(

                current == null
                        ? null
                        : current.weightKg(),

                current == null
                        ? null
                        : current.measuredOn(),

                reference == null
                        ? null
                        : reference.weightKg(),

                reference == null
                        ? null
                        : reference.measuredOn(),

                weightChangeKg,

                weightChangePercentage,

                history
        );
    }

    // ==========================================
    // Methodes utilitaires
    // ==========================================

    private boolean isWithin(
            LocalDate date,
            LocalDate from,
            LocalDate to
    ) {

        return !date.isBefore(from)
                && !date.isAfter(to);
    }

    private <T> BigDecimal average(
            List<T> values,
            Function<T, ? extends Number> extractor
    ) {

        List<BigDecimal> availableValues =
                values.stream()
                        .map(extractor)
                        .filter(Objects::nonNull)
                        .map(value ->
                                new BigDecimal(
                                        value.toString()
                                )
                        )
                        .toList();

        if (availableValues.isEmpty()) {

            return null;
        }

        BigDecimal sum = availableValues.stream()
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return sum.divide(
                BigDecimal.valueOf(
                        availableValues.size()
                ),
                DECIMAL_SCALE,
                RoundingMode.HALF_UP
        );
    }

    private <T> int countAvailable(
            List<T> values,
            Function<T, ?> extractor
    ) {

        return (int) values.stream()
                .map(extractor)
                .filter(Objects::nonNull)
                .count();
    }

    private BigDecimal percentage(
            int numerator,
            int denominator
    ) {

        if (denominator <= 0) {

            return null;
        }

        return BigDecimal.valueOf(numerator)
                .multiply(ONE_HUNDRED)
                .divide(
                        BigDecimal.valueOf(denominator),
                        DECIMAL_SCALE,
                        RoundingMode.HALF_UP
                );
    }
}
package com.fitcoach.recovery.service;

import com.fitcoach.recovery.domain.RecoveryAssessment;
import com.fitcoach.recovery.domain.RecoveryCheckin;
import com.fitcoach.recovery.domain.RecoveryDataStatus;
import com.fitcoach.recovery.domain.SleepLog;
import com.fitcoach.recovery.dto.RecoveryAssessmentResponse;
import com.fitcoach.recovery.dto.RecoveryTrainingSummaryResponse;
import com.fitcoach.recovery.exception.InvalidRecoveryException;
import com.fitcoach.recovery.exception.RecoveryNotFoundException;
import com.fitcoach.recovery.repository.RecoveryAssessmentRepository;
import com.fitcoach.recovery.repository.RecoveryCheckinRepository;
import com.fitcoach.recovery.repository.SleepLogRepository;
import com.fitcoach.recovery.service.scoring.BodyBatteryCalculator;
import com.fitcoach.recovery.service.scoring.SleepScoreCalculator;
import com.fitcoach.recovery.service.scoring.TrainingLoadCalculator;
import com.fitcoach.recovery.service.scoring.TrainingReadinessCalculator;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecoveryAssessmentService {

    private static final int SLEEP_HISTORY_DAYS = 7;

    private static final int MAX_RANGE_DAYS = 366;

    private final RecoveryAssessmentRepository assessmentRepository;

    private final SleepLogRepository sleepLogRepository;

    private final RecoveryCheckinRepository checkinRepository;

    private final RecoverySettingsService settingsService;

    private final RecoveryTrainingService trainingService;

    private final Clock clock;

    public RecoveryAssessmentService(
            RecoveryAssessmentRepository assessmentRepository,
            SleepLogRepository sleepLogRepository,
            RecoveryCheckinRepository checkinRepository,
            RecoverySettingsService settingsService,
            RecoveryTrainingService trainingService,
            Clock clock
    ) {

        this.assessmentRepository = assessmentRepository;
        this.sleepLogRepository = sleepLogRepository;
        this.checkinRepository = checkinRepository;
        this.settingsService = settingsService;
        this.trainingService = trainingService;
        this.clock = clock;
    }

    public RecoveryAssessmentResponse getAssessment(
            UUID userId,
            LocalDate date
    ) {

        validateDate(date);

        return assessmentRepository
                .findByUserIdAndAssessmentDate(userId, date)
                .map(RecoveryAssessmentResponse::from)
                .orElseThrow(() ->
                        new RecoveryNotFoundException(
                                "Evaluation de recuperation "
                                + "introuvable pour cette date."
                        )
                );
    }

    public List<RecoveryAssessmentResponse> getHistory(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        return assessmentRepository
                .findByUserIdAndAssessmentDateBetweenOrderByAssessmentDateAsc(
                        userId,
                        from,
                        to
                )
                .stream()
                .map(RecoveryAssessmentResponse::from)
                .toList();
    }

    @Transactional
    public RecoveryAssessmentResponse calculateToday(
            UUID userId
    ) {

        return calculateAndSave(
                userId,
                LocalDate.now(clock)
        );
    }

    @Transactional
    public RecoveryAssessmentResponse calculateAssessment(
            UUID userId,
            LocalDate date
    ) {

        validateDate(date);

        return calculateAndSave(userId, date);
    }

    @Transactional
    public List<RecoveryAssessmentResponse> recalculateRange(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        List<RecoveryAssessmentResponse> results =
                new ArrayList<>();

        for (LocalDate date = from;
             !date.isAfter(to);
             date = date.plusDays(1)) {

            results.add(
                    calculateAndSave(userId, date)
            );
        }

        return List.copyOf(results);
    }

    private RecoveryAssessmentResponse calculateAndSave(
            UUID userId,
            LocalDate date
    ) {

        Instant referenceTime =
                resolveReferenceTime(date);

        SleepLog sleepLog = sleepLogRepository
                .findByUserIdAndSleepDate(userId, date)
                .orElse(null);

        RecoveryCheckin checkin = checkinRepository
                .findByUserIdAndCheckinDate(userId, date)
                .orElse(null);

        int sleepTargetMinutes =
                settingsService.getSleepTargetMinutes(userId);

        List<RecoveryTrainingSummaryResponse> trainingDays =
                trainingService.getDailySummaries(
                        userId,
                        date.minusDays(2),
                        date
                );

        RecoveryTrainingSummaryResponse twoDaysAgo =
                trainingDays.get(0);

        RecoveryTrainingSummaryResponse yesterday =
                trainingDays.get(1);

        RecoveryTrainingSummaryResponse today =
                trainingDays.get(2);

        BigDecimal dailyTrainingLoad =
                today.trainingLoad();

        BigDecimal recentTrainingLoad =
                TrainingLoadCalculator.calculateRecentLoad(
                        today.trainingLoad(),
                        yesterday.trainingLoad(),
                        twoDaysAgo.trainingLoad()
                ).orElse(null);

        Integer previousBodyBattery =
                findPreviousBodyBattery(userId, date);

        // 1. Sleep Score

        SleepScoreCalculator.Result sleepResult =
                calculateSleepScore(
                        userId,
                        date,
                        sleepLog,
                        sleepTargetMinutes
                );

        Integer sleepScore = sleepResult == null
                ? null
                : sleepResult.score();

        // 2. Body Battery

        Double hoursAwake = calculateHoursAwake(
                sleepLog,
                referenceTime
        );

        BodyBatteryCalculator.Result batteryResult =
                BodyBatteryCalculator.calculate(
                        previousBodyBattery,
                        sleepScore,
                        dailyTrainingLoad,

                        checkin == null
                                ? null
                                : checkin.getStressLevel(),

                        hoursAwake,

                        checkin == null
                                ? null
                                : checkin.getEnergyLevel()
                ).orElse(null);

        Integer bodyBattery = batteryResult == null
                ? null
                : batteryResult.score();

        // 3. Training Readiness

        Double hoursSinceLastWorkout =
                trainingService.hoursSinceLastWorkout(
                        userId,
                        referenceTime
                ).orElse(null);

        TrainingReadinessCalculator.Result readinessResult =
                TrainingReadinessCalculator.calculate(
                        bodyBattery,
                        sleepScore,
                        recentTrainingLoad,

                        checkin == null
                                ? null
                                : checkin.getMuscleSoreness(),

                        hoursSinceLastWorkout
                ).orElse(null);

        // 4. Statut de disponibilite des donnees

        RecoveryDataStatus dataStatus =
                resolveDataStatus(
                        sleepResult,
                        batteryResult,
                        readinessResult,
                        trainingDays
                );

        // 5. Details explicatifs

        Map<String, Object> calculationDetails =
                buildCalculationDetails(
                        referenceTime,
                        sleepTargetMinutes,
                        sleepLog,
                        checkin,
                        today,
                        yesterday,
                        twoDaysAgo,
                        sleepResult,
                        batteryResult,
                        readinessResult,
                        recentTrainingLoad,
                        hoursAwake,
                        hoursSinceLastWorkout
                );

        // 6. Enregistrement de l'evaluation

        RecoveryAssessment assessment =
                assessmentRepository
                        .findByUserIdAndAssessmentDate(
                                userId,
                                date
                        )
                        .orElseGet(() ->
                                new RecoveryAssessment(
                                        userId,
                                        date
                                )
                        );

        assessment.setSleepScore(sleepScore);

        assessment.setBodyBattery(bodyBattery);

        assessment.setTrainingReadiness(
                readinessResult == null
                        ? null
                        : readinessResult.score()
        );

        assessment.setTrainingLoad(
                dailyTrainingLoad
        );

        assessment.setRecentTrainingLoad(
                recentTrainingLoad
        );

        assessment.setActiveCaloriesKcal(
                today.activeCaloriesKcal()
        );

        assessment.setPreviousBodyBattery(
                batteryResult == null
                        ? null
                        : batteryResult.previousBodyBattery()
        );

        assessment.setSleepRecharge(
                batteryResult == null
                        ? null
                        : batteryResult.sleepRecharge()
        );

        assessment.setTrainingDrain(
                batteryResult == null
                        ? null
                        : batteryResult.trainingDrain()
        );

        assessment.setStressDrain(
                batteryResult == null
                        ? null
                        : batteryResult.stressDrain()
        );

        assessment.setDailyDrain(
                batteryResult == null
                        ? null
                        : batteryResult.dailyDrain()
        );

        assessment.setRecommendation(
                readinessResult == null
                        ? null
                        : readinessResult.recommendation()
        );

        assessment.setDataStatus(dataStatus);

        assessment.setCalculationDetails(
                calculationDetails
        );

        assessment.setAlgorithmVersion(
                RecoveryAssessment.CURRENT_ALGORITHM_VERSION
        );

        assessment.setCalculatedAt(
                Instant.now(clock)
        );

        return RecoveryAssessmentResponse.from(
                assessmentRepository.saveAndFlush(assessment)
        );
    }

    private SleepScoreCalculator.Result calculateSleepScore(
            UUID userId,
            LocalDate date,
            SleepLog sleepLog,
            int targetMinutes
    ) {

        if (sleepLog == null) {
            return null;
        }

        ZoneId zone = clock.getZone();

        List<SleepScoreCalculator.SleepTiming> previousNights =
                sleepLogRepository
                        .findByUserIdAndSleepDateBetweenOrderBySleepDateAsc(
                                userId,
                                date.minusDays(SLEEP_HISTORY_DAYS),
                                date.minusDays(1)
                        )
                        .stream()
                        .map(previous ->
                                new SleepScoreCalculator.SleepTiming(
                                        previous.getBedtime()
                                                .atZone(zone)
                                                .toLocalTime(),

                                        previous.getWakeTime()
                                                .atZone(zone)
                                                .toLocalTime()
                                )
                        )
                        .toList();

        return SleepScoreCalculator.calculate(
                sleepLog.getEstimatedSleepMinutes(),
                targetMinutes,
                sleepLog.getSleepQuality(),
                sleepLog.getNightAwakenings(),

                sleepLog.getBedtime()
                        .atZone(zone)
                        .toLocalTime(),

                sleepLog.getWakeTime()
                        .atZone(zone)
                        .toLocalTime(),

                previousNights,

                sleepLog.getAwakeMinutes() != null
        ).orElse(null);
    }

    private Integer findPreviousBodyBattery(
            UUID userId,
            LocalDate date
    ) {

        return assessmentRepository
                .findByUserIdAndAssessmentDate(
                        userId,
                        date.minusDays(1)
                )
                .map(RecoveryAssessment::getBodyBattery)
                .orElse(null);
    }

    private Double calculateHoursAwake(
            SleepLog sleepLog,
            Instant referenceTime
    ) {

        if (sleepLog == null ||
                sleepLog.getWakeTime().isAfter(referenceTime)) {

            return null;
        }

        double hours = Duration.between(
                sleepLog.getWakeTime(),
                referenceTime
        ).toMillis() / 3600000.0;

        return Math.max(
                0.0,
                Math.min(24.0, hours)
        );
    }

    // ==========================================
    // Qualite et disponibilite des donnees
    // ==========================================

    private RecoveryDataStatus resolveDataStatus(
            SleepScoreCalculator.Result sleepResult,
            BodyBatteryCalculator.Result batteryResult,
            TrainingReadinessCalculator.Result readinessResult,
            List<RecoveryTrainingSummaryResponse> trainingDays
    ) {

        if (sleepResult == null &&
                batteryResult == null &&
                readinessResult == null) {

            return RecoveryDataStatus.INSUFFICIENT;
        }

        boolean completeTrainingData = trainingDays
                .stream()
                .allMatch(day ->
                        day.dataStatus() ==
                                RecoveryDataStatus.COMPLETE
                );

        boolean complete =
                sleepResult != null &&
                sleepResult.complete() &&
                batteryResult != null &&
                !batteryResult.initialized() &&
                readinessResult != null &&
                readinessResult.complete() &&
                completeTrainingData;

        return complete
                ? RecoveryDataStatus.COMPLETE
                : RecoveryDataStatus.PARTIAL;
    }

    // ==========================================
    // Construction des details JSON
    // ==========================================

    private Map<String, Object> buildCalculationDetails(
            Instant referenceTime,
            int sleepTargetMinutes,
            SleepLog sleepLog,
            RecoveryCheckin checkin,
            RecoveryTrainingSummaryResponse today,
            RecoveryTrainingSummaryResponse yesterday,
            RecoveryTrainingSummaryResponse twoDaysAgo,
            SleepScoreCalculator.Result sleepResult,
            BodyBatteryCalculator.Result batteryResult,
            TrainingReadinessCalculator.Result readinessResult,
            BigDecimal recentTrainingLoad,
            Double hoursAwake,
            Double hoursSinceLastWorkout
    ) {

        Map<String, Object> details =
                new LinkedHashMap<>();

        details.put(
                "referenceTime",
                referenceTime.toString()
        );

        details.put(
                "timeZone",
                clock.getZone().getId()
        );

        details.put(
                "experimentalModel",
                true
        );

        details.put(
                "sleep",
                buildSleepDetails(
                        sleepLog,
                        sleepTargetMinutes,
                        sleepResult
                )
        );

        details.put(
                "checkin",
                buildCheckinDetails(checkin)
        );

        details.put(
                "training",
                buildTrainingDetails(
                        today,
                        yesterday,
                        twoDaysAgo,
                        recentTrainingLoad,
                        hoursSinceLastWorkout
                )
        );

        details.put(
                "bodyBattery",
                buildBatteryDetails(
                        batteryResult,
                        hoursAwake
                )
        );

        details.put(
                "trainingReadiness",
                buildReadinessDetails(
                        readinessResult
                )
        );

        List<String> missingData =
                new ArrayList<>();

        if (sleepLog == null) {
            missingData.add("SLEEP_LOG");
        }

        if (checkin == null) {
            missingData.add("DAILY_CHECKIN");
        }

        if (!today.hasCompleteTrainingLoad()) {
            missingData.add("DAILY_TRAINING_LOAD");
        }

        if (recentTrainingLoad == null) {
            missingData.add("RECENT_TRAINING_LOAD");
        }

        if (!today.hasCompleteCalories()) {
            missingData.add("ACTIVE_CALORIES");
        }

        if (hoursSinceLastWorkout == null) {
            missingData.add("LAST_WORKOUT_REFERENCE");
        }

        details.put("missingData", missingData);

        return details;
    }

    private Map<String, Object> buildSleepDetails(
            SleepLog sleepLog,
            int targetMinutes,
            SleepScoreCalculator.Result result
    ) {

        Map<String, Object> details =
                new LinkedHashMap<>();

        details.put("available", result != null);
        details.put("targetMinutes", targetMinutes);

        if (sleepLog != null) {

            details.put(
                    "estimatedSleepMinutes",
                    sleepLog.getEstimatedSleepMinutes()
            );

            details.put(
                    "timeInBedMinutes",
                    sleepLog.getTimeInBedMinutes()
            );

            details.put(
                    "awakeMinutes",
                    sleepLog.getAwakeMinutes()
            );

            details.put(
                    "sleepDurationApproximate",
                    sleepLog.getAwakeMinutes() == null
            );

            details.put(
                    "declaredQuality",
                    sleepLog.getSleepQuality()
            );

            details.put(
                    "nightAwakenings",
                    sleepLog.getNightAwakenings()
            );
        }

        if (result != null) {

            details.put("score", result.score());

            details.put(
                    "durationScore",
                    result.durationScore()
            );

            details.put(
                    "qualityScore",
                    result.qualityScore()
            );

            details.put(
                    "regularityScore",
                    result.regularityScore()
            );

            details.put(
                    "awakeningsScore",
                    result.awakeningsScore()
            );

            details.put(
                    "availableWeight",
                    result.availableWeight()
            );

            details.put(
                    "complete",
                    result.complete()
            );
        }

        return details;
    }

    private Map<String, Object> buildCheckinDetails(
            RecoveryCheckin checkin
    ) {

        Map<String, Object> details =
                new LinkedHashMap<>();

        details.put(
                "available",
                checkin != null
        );

        if (checkin != null) {

            details.put(
                    "energyLevel",
                    checkin.getEnergyLevel()
            );

            details.put(
                    "fatigueLevel",
                    checkin.getFatigueLevel()
            );

            details.put(
                    "stressLevel",
                    checkin.getStressLevel()
            );

            details.put(
                    "muscleSoreness",
                    checkin.getMuscleSoreness()
            );
        }

        return details;
    }

    private Map<String, Object> buildTrainingDetails(
            RecoveryTrainingSummaryResponse today,
            RecoveryTrainingSummaryResponse yesterday,
            RecoveryTrainingSummaryResponse twoDaysAgo,
            BigDecimal recentTrainingLoad,
            Double hoursSinceLastWorkout
    ) {

        Map<String, Object> details =
                new LinkedHashMap<>();

        details.put(
                "totalSessions",
                today.totalSessions()
        );

        details.put(
                "sessionsWithTrainingLoad",
                today.sessionsWithTrainingLoad()
        );

        details.put(
                "sessionsWithCalories",
                today.sessionsWithCalories()
        );

        details.put(
                "sessionsWithEstimatedRpe",
                today.sessionsWithEstimatedRpe()
        );

        details.put(
                "recordedDurationMinutes",
                today.recordedDurationMinutes()
        );

        details.put(
                "todayLoad",
                today.trainingLoad()
        );

        details.put(
                "yesterdayLoad",
                yesterday.trainingLoad()
        );

        details.put(
                "twoDaysAgoLoad",
                twoDaysAgo.trainingLoad()
        );

        details.put(
                "recentTrainingLoad",
                recentTrainingLoad
        );

        details.put(
                "knownTrainingLoad",
                today.knownTrainingLoad()
        );

        details.put(
                "activeCaloriesKcal",
                today.activeCaloriesKcal()
        );

        details.put(
                "knownActiveCaloriesKcal",
                today.knownActiveCaloriesKcal()
        );

        details.put(
                "hoursSinceLastWorkout",
                hoursSinceLastWorkout
        );

        details.put(
                "restTimeApproximate",
                true
        );

        details.put(
                "dataStatus",
                today.dataStatus().name()
        );

        return details;
    }

    private Map<String, Object> buildBatteryDetails(
            BodyBatteryCalculator.Result result,
            Double hoursAwake
    ) {

        Map<String, Object> details =
                new LinkedHashMap<>();

        details.put("available", result != null);
        details.put("hoursAwake", hoursAwake);

        if (result != null) {

            details.put("score", result.score());

            details.put(
                    "initialized",
                    result.initialized()
            );

            details.put(
                    "previousBodyBattery",
                    result.previousBodyBattery()
            );

            details.put(
                    "sleepRecharge",
                    result.sleepRecharge()
            );

            details.put(
                    "morningBattery",
                    result.morningBattery()
            );

            details.put(
                    "trainingDrain",
                    result.trainingDrain()
            );

            details.put(
                    "stressDrain",
                    result.stressDrain()
            );

            details.put(
                    "dailyDrain",
                    result.dailyDrain()
            );

            details.put(
                    "estimatedBattery",
                    result.estimatedBattery()
            );
        }

        return details;
    }

    private Map<String, Object> buildReadinessDetails(
            TrainingReadinessCalculator.Result result
    ) {

        Map<String, Object> details =
                new LinkedHashMap<>();

        details.put("available", result != null);

        if (result != null) {

            details.put("score", result.score());

            details.put(
                    "bodyBattery",
                    result.bodyBattery()
            );

            details.put(
                    "sleepScore",
                    result.sleepScore()
            );

            details.put(
                    "loadScore",
                    result.loadScore()
            );

            details.put(
                    "sorenessScore",
                    result.sorenessScore()
            );

            details.put(
                    "restScore",
                    result.restScore()
            );

            details.put(
                    "availableWeight",
                    result.availableWeight()
            );

            details.put(
                    "level",
                    result.level().name()
            );

            details.put(
                    "recommendation",
                    result.recommendation().name()
            );

            details.put(
                    "complete",
                    result.complete()
            );
        }

        return details;
    }

    private Instant resolveReferenceTime(
            LocalDate date
    ) {

        Instant endOfDay = date
                .plusDays(1)
                .atStartOfDay(clock.getZone())
                .toInstant();

        Instant now = Instant.now(clock);

        return endOfDay.isAfter(now)
                ? now
                : endOfDay;
    }

    private void validateDate(LocalDate date) {

        if (date == null ||
                date.isAfter(LocalDate.now(clock))) {

            throw new InvalidRecoveryException(
                    "La date d'evaluation est invalide."
            );
        }
    }

    private void validateDateRange(
            LocalDate from,
            LocalDate to
    ) {

        validateDate(from);
        validateDate(to);

        if (from.isAfter(to)) {

            throw new InvalidRecoveryException(
                    "La periode de consultation est invalide."
            );
        }

        long numberOfDays =
                ChronoUnit.DAYS.between(from, to) + 1;

        if (numberOfDays > MAX_RANGE_DAYS) {

            throw new InvalidRecoveryException(
                    "La periode ne peut pas depasser "
                    + MAX_RANGE_DAYS + " jours."
            );
        }
    }
}
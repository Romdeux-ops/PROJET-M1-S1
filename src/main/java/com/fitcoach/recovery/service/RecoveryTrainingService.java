package com.fitcoach.recovery.service;

import com.fitcoach.identity.api.AthleteWeight;
import com.fitcoach.recovery.domain.ActivityType;
import com.fitcoach.recovery.domain.RecoveryDataStatus;
import com.fitcoach.recovery.domain.RecoveryWorkoutDetails;
import com.fitcoach.recovery.dto.RecoveryTrainingSummaryResponse;
import com.fitcoach.recovery.dto.RecoveryWorkoutResponse;
import com.fitcoach.recovery.exception.InvalidRecoveryException;
import com.fitcoach.recovery.exception.RecoveryNotFoundException;
import com.fitcoach.recovery.repository.RecoveryWorkoutDetailsRepository;
import com.fitcoach.recovery.service.scoring.CalorieCalculator;
import com.fitcoach.recovery.service.scoring.TrainingLoadCalculator;
import com.fitcoach.training.api.WorkoutActivity;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecoveryTrainingService {

    private final WorkoutActivity workoutActivity;

    private final AthleteWeight athleteWeight;

    private final RecoveryWorkoutDetailsRepository detailsRepository;

    private final Clock clock;

    public RecoveryTrainingService(
            WorkoutActivity workoutActivity,
            AthleteWeight athleteWeight,
            RecoveryWorkoutDetailsRepository detailsRepository,
            Clock clock
    ) {

        this.workoutActivity = workoutActivity;
        this.athleteWeight = athleteWeight;
        this.detailsRepository = detailsRepository;
        this.clock = clock;
    }

    // ==========================================
    // Consultation d'une seance
    // ==========================================

    public RecoveryWorkoutResponse getWorkout(
            UUID userId,
            UUID workoutSessionId
    ) {

        WorkoutActivity.Session session = workoutActivity
                .findSession(userId, workoutSessionId)
                .orElseThrow(() ->
                        new RecoveryNotFoundException(
                                "Seance d'entrainement introuvable."
                        )
                );

        RecoveryWorkoutDetails details = detailsRepository
                .findById(workoutSessionId)
                .orElse(null);

        LocalDate sessionDate = resolveSessionDate(session);

        AthleteWeight.Measurement weight = athleteWeight
                .weightAt(userId, sessionDate)
                .orElse(null);

        return calculateWorkout(
                session,
                details,
                weight
        );
    }

    // ==========================================
    // Consultation des seances sur une periode
    // ==========================================

    public List<RecoveryWorkoutResponse> getWorkouts(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        Instant fromInclusive = from
                .atStartOfDay(clock.getZone())
                .toInstant();

        Instant toExclusive = to
                .plusDays(1)
                .atStartOfDay(clock.getZone())
                .toInstant();

        Instant now = Instant.now(clock);

        if (toExclusive.isAfter(now)) {
            toExclusive = now;
        }

        if (!fromInclusive.isBefore(toExclusive)) {
            return List.of();
        }

        List<WorkoutActivity.Session> sessions =
                workoutActivity.sessionsBetween(
                        userId,
                        fromInclusive,
                        toExclusive
                );

        if (sessions.isEmpty()) {
            return List.of();
        }

        List<UUID> sessionIds = sessions
                .stream()
                .map(WorkoutActivity.Session::id)
                .toList();

        Map<UUID, RecoveryWorkoutDetails> detailsBySession =
                detailsRepository
                        .findByWorkoutSessionIdIn(sessionIds)
                        .stream()
                        .collect(Collectors.toMap(
                                RecoveryWorkoutDetails
                                        ::getWorkoutSessionId,
                                Function.identity()
                        ));

        Map<LocalDate, Optional<AthleteWeight.Measurement>>
                weightByDate = new HashMap<>();

        return sessions
                .stream()
                .map(session -> {

                    LocalDate sessionDate =
                            resolveSessionDate(session);

                    AthleteWeight.Measurement weight =
                            weightByDate.computeIfAbsent(
                                    sessionDate,
                                    date -> athleteWeight.weightAt(
                                            userId,
                                            date
                                    )
                            ).orElse(null);

                    return calculateWorkout(
                            session,
                            detailsBySession.get(session.id()),
                            weight
                    );
                })
                .toList();
    }

    // ==========================================
    // Synthese sportive quotidienne
    // ==========================================

    public RecoveryTrainingSummaryResponse getDailySummary(
            UUID userId,
            LocalDate date
    ) {

        validateDateRange(date, date);

        List<RecoveryWorkoutResponse> workouts =
                getWorkouts(userId, date, date);

        return summarize(date, workouts);
    }

    // ==========================================
    // Syntheses sportives sur une periode
    // ==========================================

    public List<RecoveryTrainingSummaryResponse> getDailySummaries(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        List<RecoveryWorkoutResponse> workouts =
                getWorkouts(userId, from, to);

        Map<LocalDate, List<RecoveryWorkoutResponse>>
                workoutsByDate = workouts
                        .stream()
                        .collect(Collectors.groupingBy(
                                workout -> workout.performedAt()
                                        .atZone(clock.getZone())
                                        .toLocalDate()
                        ));

        return from
                .datesUntil(to.plusDays(1))
                .map(date -> summarize(
                        date,
                        workoutsByDate.getOrDefault(
                                date,
                                List.of()
                        )
                ))
                .toList();
    }

    // ==========================================
    // Temps depuis le dernier entrainement
    // ==========================================

    public Optional<Double> hoursSinceLastWorkout(
            UUID userId,
            Instant referenceTime
    ) {

        if (referenceTime == null ||
                referenceTime.isAfter(Instant.now(clock))) {

            throw new InvalidRecoveryException(
                    "L'instant de reference est invalide."
            );
        }

        return workoutActivity
                .lastSessionBefore(userId, referenceTime)
                .map(session -> {

                    Duration duration = Duration.between(
                            session.performedAt(),
                            referenceTime
                    );

                    return Math.max(
                            0.0,
                            duration.toMillis() / 3600000.0
                    );
                });
    }

    // ==========================================
    // Calcul des indicateurs d'une seance
    // ==========================================

    private RecoveryWorkoutResponse calculateWorkout(
            WorkoutActivity.Session session,
            RecoveryWorkoutDetails details,
            AthleteWeight.Measurement weight
    ) {

        ActivityType activityType = details == null
                ? null
                : details.getActivityType();

        BigDecimal sessionRpe = details == null
                ? null
                : details.getSessionRpe();

        BigDecimal weightKg = weight == null
                ? null
                : weight.weightKg();

        LocalDate weightMeasuredOn = weight == null
                ? null
                : weight.measuredOn();

        TrainingLoadCalculator.EffectiveRpe effectiveRpe =
                TrainingLoadCalculator.resolveRpe(
                        sessionRpe,
                        session.averageSetRpe()
                ).orElse(null);

        TrainingLoadCalculator.Result load =
                TrainingLoadCalculator.calculate(
                        session.durationMinutes(),
                        sessionRpe,
                        session.averageSetRpe()
                ).orElse(null);

        CalorieCalculator.Result calories =
                CalorieCalculator.calculate(
                        activityType,
                        weightKg,
                        session.durationMinutes(),
                        effectiveRpe == null
                                ? null
                                : effectiveRpe.value()
                ).orElse(null);

        List<String> missingData = new ArrayList<>();

        if (session.durationMinutes() == null ||
                session.durationMinutes() <= 0 ||
                session.durationMinutes() > 600) {

            missingData.add("DURATION");
        }

        if (activityType == null ||
                activityType == ActivityType.OTHER) {

            missingData.add("ACTIVITY_TYPE");
        }

        if (weightKg == null) {
            missingData.add("BODY_WEIGHT");
        }

        if (effectiveRpe == null) {
            missingData.add("RPE");
        }

        boolean estimatedRpe = effectiveRpe != null &&
                effectiveRpe.source() ==
                        TrainingLoadCalculator.RpeSource.SET_AVERAGE;

        RecoveryDataStatus dataStatus;

        if (load == null && calories == null) {

            dataStatus = RecoveryDataStatus.INSUFFICIENT;

        } else if (load == null ||
                calories == null ||
                estimatedRpe ||
                !missingData.isEmpty()) {

            dataStatus = RecoveryDataStatus.PARTIAL;

        } else {

            dataStatus = RecoveryDataStatus.COMPLETE;
        }

        return new RecoveryWorkoutResponse(
                session.id(),
                session.title(),
                session.performedAt(),
                session.durationMinutes(),
                activityType,
                sessionRpe,
                session.averageSetRpe(),

                effectiveRpe == null
                        ? null
                        : effectiveRpe.value(),

                effectiveRpe == null
                        ? null
                        : effectiveRpe.source().name(),

                session.totalSets(),
                session.setsWithRpe(),

                weightKg,
                weightMeasuredOn,

                calories == null
                        ? null
                        : calories.met(),

                calories == null
                        ? null
                        : calories.intensity().name(),

                calories == null
                        ? null
                        : calories.totalCaloriesKcal(),

                calories == null
                        ? null
                        : calories.activeCaloriesKcal(),

                load == null
                        ? null
                        : load.trainingLoad(),

                dataStatus,
                missingData
        );
    }

    // ==========================================
    // Agregation des resultats quotidiens
    // ==========================================

    private RecoveryTrainingSummaryResponse summarize(
            LocalDate date,
            List<RecoveryWorkoutResponse> workouts
    ) {

        int totalSessions = workouts.size();

        int sessionsWithDuration = 0;
        int sessionsWithTrainingLoad = 0;
        int sessionsWithCalories = 0;
        int sessionsWithEstimatedRpe = 0;

        long recordedDurationMinutes = 0;

        BigDecimal knownTrainingLoad = BigDecimal.ZERO;

        BigDecimal knownActiveCalories = BigDecimal.ZERO;

        boolean allComplete = true;

        for (RecoveryWorkoutResponse workout : workouts) {

            if (workout.durationMinutes() != null &&
                    workout.durationMinutes() > 0 &&
                    workout.durationMinutes() <= 600) {

                sessionsWithDuration++;

                recordedDurationMinutes +=
                        workout.durationMinutes();
            }

            if (workout.trainingLoad() != null) {

                sessionsWithTrainingLoad++;

                knownTrainingLoad = knownTrainingLoad.add(
                        workout.trainingLoad()
                );
            }

            if (workout.activeCaloriesKcal() != null) {

                sessionsWithCalories++;

                knownActiveCalories = knownActiveCalories.add(
                        workout.activeCaloriesKcal()
                );
            }

            if ("SET_AVERAGE".equals(workout.rpeSource())) {
                sessionsWithEstimatedRpe++;
            }

            if (workout.dataStatus() !=
                    RecoveryDataStatus.COMPLETE) {

                allComplete = false;
            }
        }

        BigDecimal totalTrainingLoad =
                sessionsWithTrainingLoad == totalSessions
                        ? knownTrainingLoad
                        : null;

        BigDecimal totalActiveCalories =
                sessionsWithCalories == totalSessions
                        ? knownActiveCalories
                        : null;

        RecoveryDataStatus dataStatus;

        if (allComplete) {

            dataStatus = RecoveryDataStatus.COMPLETE;

        } else if (sessionsWithTrainingLoad == 0 &&
                sessionsWithCalories == 0) {

            dataStatus = RecoveryDataStatus.INSUFFICIENT;

        } else {

            dataStatus = RecoveryDataStatus.PARTIAL;
        }

        return new RecoveryTrainingSummaryResponse(
                date,
                totalSessions,
                sessionsWithDuration,
                sessionsWithTrainingLoad,
                sessionsWithCalories,
                sessionsWithEstimatedRpe,
                recordedDurationMinutes,
                totalTrainingLoad,
                totalActiveCalories,
                knownTrainingLoad,
                knownActiveCalories,
                dataStatus,
                workouts
        );
    }

    // ==========================================
    // Methodes utilitaires
    // ==========================================

    private LocalDate resolveSessionDate(
            WorkoutActivity.Session session
    ) {

        return session.performedAt()
                .atZone(clock.getZone())
                .toLocalDate();
    }

    private void validateDateRange(
            LocalDate from,
            LocalDate to
    ) {

        if (from == null ||
                to == null ||
                from.isAfter(to)) {

            throw new InvalidRecoveryException(
                    "La periode de consultation est invalide."
            );
        }

        if (to.isAfter(LocalDate.now(clock))) {

            throw new InvalidRecoveryException(
                    "La periode ne peut pas contenir "
                    + "de dates futures."
            );
        }

        if (Duration.between(
                from.atStartOfDay(),
                to.atStartOfDay()
        ).toDays() > 365) {

            throw new InvalidRecoveryException(
                    "La periode de consultation "
                    + "ne peut pas depasser 366 jours."
            );
        }
    }
}
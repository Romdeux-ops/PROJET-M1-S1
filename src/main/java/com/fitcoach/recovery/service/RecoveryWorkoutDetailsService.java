package com.fitcoach.recovery.service;

import com.fitcoach.recovery.domain.RecoveryWorkoutDetails;
import com.fitcoach.recovery.dto.RecoveryWorkoutDetailsRequest;
import com.fitcoach.recovery.dto.RecoveryWorkoutDetailsResponse;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent.ChangeType;
import com.fitcoach.recovery.exception.InvalidRecoveryException;
import com.fitcoach.recovery.exception.RecoveryNotFoundException;
import com.fitcoach.recovery.repository.RecoveryWorkoutDetailsRepository;
import com.fitcoach.training.api.WorkoutActivity;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecoveryWorkoutDetailsService {

    private static final BigDecimal MIN_RPE =
            BigDecimal.ONE;

    private static final BigDecimal MAX_RPE =
            BigDecimal.TEN;

    private final RecoveryWorkoutDetailsRepository detailsRepository;
    private final WorkoutActivity workoutActivity;
    private final Clock clock;
    private final ApplicationEventPublisher eventPublisher;

    public RecoveryWorkoutDetailsService(
            RecoveryWorkoutDetailsRepository detailsRepository,
            WorkoutActivity workoutActivity,
            Clock clock,
            ApplicationEventPublisher eventPublisher
    ) {
        this.detailsRepository = detailsRepository;
        this.workoutActivity = workoutActivity;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
    }

    public RecoveryWorkoutDetailsResponse getDetails(
            UUID userId,
            UUID workoutSessionId
    ) {

        requireOwnedSession(userId, workoutSessionId);

        return detailsRepository
                .findById(workoutSessionId)
                .map(RecoveryWorkoutDetailsResponse::from)
                .orElseThrow(() ->
                        new RecoveryNotFoundException(
                                "Informations de recuperation "
                                + "introuvables pour cette seance."
                        )
                );
    }

    @Transactional
    public RecoveryWorkoutDetailsResponse saveDetails(
            UUID userId,
            UUID workoutSessionId,
            RecoveryWorkoutDetailsRequest request
    ) {

        WorkoutActivity.Session session =
                requireOwnedSession(
                        userId,
                        workoutSessionId
                );

        validateRpe(request.sessionRpe());

        RecoveryWorkoutDetails details = detailsRepository
                .findById(workoutSessionId)
                .orElseGet(() -> new RecoveryWorkoutDetails(
                        workoutSessionId,
                        request.activityType(),
                        request.sessionRpe()
                ));

        details.setActivityType(request.activityType());
        details.setSessionRpe(request.sessionRpe());

        RecoveryWorkoutDetails saved =
                detailsRepository.saveAndFlush(details);

        LocalDate sessionDate = session.performedAt()
                .atZone(clock.getZone())
                .toLocalDate();

        eventPublisher.publishEvent(
                new RecoveryDataChangedEvent(
                        userId,
                        sessionDate,
                        ChangeType.WORKOUT_DETAILS_SAVED
                )
        );

        return RecoveryWorkoutDetailsResponse.from(saved);
    }

    @Transactional
    public void deleteDetails(
            UUID userId,
            UUID workoutSessionId
    ) {

        WorkoutActivity.Session session =
                requireOwnedSession(
                        userId,
                        workoutSessionId
                );

        LocalDate sessionDate = session.performedAt()
                .atZone(clock.getZone())
                .toLocalDate();

        detailsRepository
                .findById(workoutSessionId)
                .ifPresent(details -> {

                    detailsRepository.delete(details);

                    eventPublisher.publishEvent(
                            new RecoveryDataChangedEvent(
                                    userId,
                                    sessionDate,
                                    ChangeType.WORKOUT_DETAILS_DELETED
                            )
                    );
                });
    }

    private WorkoutActivity.Session requireOwnedSession(
            UUID userId,
            UUID workoutSessionId
    ) {

        return workoutActivity
                .findSession(userId, workoutSessionId)
                .orElseThrow(() ->
                        new RecoveryNotFoundException(
                                "Seance d'entrainement introuvable."
                        )
                );
    }

    private void validateRpe(BigDecimal rpe) {

        if (rpe == null) {
            return;
        }

        if (rpe.compareTo(MIN_RPE) < 0 ||
                rpe.compareTo(MAX_RPE) > 0 ||
                rpe.stripTrailingZeros().scale() > 1) {

            throw new InvalidRecoveryException(
                    "Le RPE doit etre compris entre 1 et 10 "
                    + "avec une decimale au maximum."
            );
        }
    }
}
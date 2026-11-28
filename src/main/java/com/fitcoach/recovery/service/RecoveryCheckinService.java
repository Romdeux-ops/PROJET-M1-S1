package com.fitcoach.recovery.service;

import com.fitcoach.recovery.domain.RecoveryCheckin;
import com.fitcoach.recovery.dto.RecoveryCheckinRequest;
import com.fitcoach.recovery.dto.RecoveryCheckinResponse;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent.ChangeType;
import com.fitcoach.recovery.exception.InvalidRecoveryException;
import com.fitcoach.recovery.exception.RecoveryNotFoundException;
import com.fitcoach.recovery.repository.RecoveryCheckinRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecoveryCheckinService {

    private final RecoveryCheckinRepository checkinRepository;
    private final Clock clock;
    private final ApplicationEventPublisher eventPublisher;

    public RecoveryCheckinService(
            RecoveryCheckinRepository checkinRepository,
            Clock clock,
            ApplicationEventPublisher eventPublisher
    ) {
        this.checkinRepository = checkinRepository;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
    }

    public List<RecoveryCheckinResponse> getCheckins(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        if (from == null || to == null || from.isAfter(to)) {
            throw new InvalidRecoveryException(
                    "La periode de consultation est invalide."
            );
        }

        return checkinRepository
                .findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(
                        userId,
                        from,
                        to
                )
                .stream()
                .map(RecoveryCheckinResponse::from)
                .toList();
    }

    public RecoveryCheckinResponse getCheckin(
            UUID userId,
            LocalDate date
    ) {

        return checkinRepository
                .findByUserIdAndCheckinDate(userId, date)
                .map(RecoveryCheckinResponse::from)
                .orElseThrow(() ->
                        new RecoveryNotFoundException(
                                "Questionnaire introuvable "
                                + "pour cette date."
                        )
                );
    }

    @Transactional
    public RecoveryCheckinResponse saveCheckin(
            UUID userId,
            RecoveryCheckinRequest request
    ) {

        validateRequest(request);

        RecoveryCheckin checkin = checkinRepository
                .findByUserIdAndCheckinDate(
                        userId,
                        request.checkinDate()
                )
                .orElseGet(() -> new RecoveryCheckin(
                        userId,
                        request.checkinDate(),
                        request.energyLevel(),
                        request.fatigueLevel(),
                        request.stressLevel(),
                        request.muscleSoreness(),
                        request.notes()
                ));

        checkin.setEnergyLevel(request.energyLevel());
        checkin.setFatigueLevel(request.fatigueLevel());
        checkin.setStressLevel(request.stressLevel());
        checkin.setMuscleSoreness(
                request.muscleSoreness()
        );
        checkin.setNotes(request.notes());

        RecoveryCheckin saved =
                checkinRepository.saveAndFlush(checkin);

        eventPublisher.publishEvent(
                new RecoveryDataChangedEvent(
                        userId,
                        saved.getCheckinDate(),
                        ChangeType.CHECKIN_SAVED
                )
        );

        return RecoveryCheckinResponse.from(saved);
    }

    @Transactional
    public void deleteCheckin(
            UUID userId,
            LocalDate date
    ) {

        checkinRepository
                .findByUserIdAndCheckinDate(userId, date)
                .ifPresent(checkin -> {

                    checkinRepository.delete(checkin);

                    eventPublisher.publishEvent(
                            new RecoveryDataChangedEvent(
                                    userId,
                                    date,
                                    ChangeType.CHECKIN_DELETED
                            )
                    );
                });
    }

    private void validateRequest(
            RecoveryCheckinRequest request
    ) {

        if (request.checkinDate() == null ||
                request.checkinDate()
                        .isAfter(LocalDate.now(clock))) {

            throw new InvalidRecoveryException(
                    "La date du questionnaire est invalide."
            );
        }

        validateLevel(
                request.energyLevel(),
                "energie"
        );

        validateLevel(
                request.fatigueLevel(),
                "fatigue"
        );

        validateLevel(
                request.stressLevel(),
                "stress"
        );

        validateLevel(
                request.muscleSoreness(),
                "douleurs musculaires"
        );
    }

    private void validateLevel(
            Integer value,
            String name
    ) {

        if (value == null || value < 0 || value > 10) {

            throw new InvalidRecoveryException(
                    "Le niveau de " + name
                    + " doit etre compris entre 0 et 10."
            );
        }
    }
}
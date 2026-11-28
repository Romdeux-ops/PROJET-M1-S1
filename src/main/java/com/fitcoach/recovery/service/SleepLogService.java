package com.fitcoach.recovery.service;

import com.fitcoach.recovery.domain.SleepLog;
import com.fitcoach.recovery.dto.SleepLogRequest;
import com.fitcoach.recovery.dto.SleepLogResponse;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent.ChangeType;
import com.fitcoach.recovery.exception.InvalidRecoveryException;
import com.fitcoach.recovery.exception.RecoveryConflictException;
import com.fitcoach.recovery.exception.RecoveryNotFoundException;
import com.fitcoach.recovery.repository.SleepLogRepository;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SleepLogService {

    private final SleepLogRepository sleepLogRepository;
    private final Clock clock;
    private final ApplicationEventPublisher eventPublisher;

    public SleepLogService(
            SleepLogRepository sleepLogRepository,
            Clock clock,
            ApplicationEventPublisher eventPublisher
    ) {
        this.sleepLogRepository = sleepLogRepository;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
    }

    public List<SleepLogResponse> getSleepLogs(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        return sleepLogRepository
                .findByUserIdAndSleepDateBetweenOrderBySleepDateAsc(
                        userId,
                        from,
                        to
                )
                .stream()
                .map(SleepLogResponse::from)
                .toList();
    }

    public SleepLogResponse getSleepLog(
            UUID userId,
            UUID sleepLogId
    ) {

        return SleepLogResponse.from(
                findOwnedOrThrow(userId, sleepLogId)
        );
    }

    @Transactional
    public SleepLogResponse createSleepLog(
            UUID userId,
            SleepLogRequest request
    ) {

        validateRequest(request);

        LocalDate sleepDate = resolveSleepDate(
                request.wakeTime()
        );

        if (sleepLogRepository.existsByUserIdAndSleepDate(
                userId,
                sleepDate
        )) {
            throw new RecoveryConflictException(
                    "Une nuit de sommeil est deja enregistree "
                    + "pour cette date."
            );
        }

        SleepLog sleepLog = new SleepLog(
                userId,
                sleepDate,
                request.bedtime(),
                request.wakeTime(),
                request.awakeMinutes(),
                request.sleepQuality(),
                request.nightAwakenings(),
                request.notes()
        );

        SleepLog saved =
                sleepLogRepository.saveAndFlush(sleepLog);

        eventPublisher.publishEvent(
                new RecoveryDataChangedEvent(
                        userId,
                        sleepDate,
                        ChangeType.SLEEP_CREATED
                )
        );

        return SleepLogResponse.from(saved);
    }

    @Transactional
    public SleepLogResponse updateSleepLog(
            UUID userId,
            UUID sleepLogId,
            SleepLogRequest request
    ) {

        SleepLog sleepLog = findOwnedOrThrow(
                userId,
                sleepLogId
        );

        validateRequest(request);

        LocalDate previousSleepDate =
                sleepLog.getSleepDate();

        LocalDate newSleepDate = resolveSleepDate(
                request.wakeTime()
        );

        sleepLogRepository
                .findByUserIdAndSleepDate(userId, newSleepDate)
                .filter(existing ->
                        !existing.getId().equals(sleepLogId))
                .ifPresent(existing -> {
                    throw new RecoveryConflictException(
                            "Une autre nuit est deja enregistree "
                            + "pour cette date."
                    );
                });

        sleepLog.setSleepDate(newSleepDate);
        sleepLog.setBedtime(request.bedtime());
        sleepLog.setWakeTime(request.wakeTime());
        sleepLog.setAwakeMinutes(request.awakeMinutes());
        sleepLog.setSleepQuality(request.sleepQuality());
        sleepLog.setNightAwakenings(
                request.nightAwakenings()
        );
        sleepLog.setNotes(request.notes());

        SleepLog saved =
                sleepLogRepository.saveAndFlush(sleepLog);

        LocalDate affectedFrom =
                previousSleepDate.isBefore(newSleepDate)
                        ? previousSleepDate
                        : newSleepDate;

        eventPublisher.publishEvent(
                new RecoveryDataChangedEvent(
                        userId,
                        affectedFrom,
                        ChangeType.SLEEP_UPDATED
                )
        );

        return SleepLogResponse.from(saved);
    }

    @Transactional
    public void deleteSleepLog(
            UUID userId,
            UUID sleepLogId
    ) {

        SleepLog sleepLog = findOwnedOrThrow(
                userId,
                sleepLogId
        );

        LocalDate affectedFrom =
                sleepLog.getSleepDate();

        sleepLogRepository.delete(sleepLog);

        eventPublisher.publishEvent(
                new RecoveryDataChangedEvent(
                        userId,
                        affectedFrom,
                        ChangeType.SLEEP_DELETED
                )
        );
    }

    private SleepLog findOwnedOrThrow(
            UUID userId,
            UUID sleepLogId
    ) {

        return sleepLogRepository
                .findByIdAndUserId(sleepLogId, userId)
                .orElseThrow(() ->
                        new RecoveryNotFoundException(
                                "Nuit de sommeil introuvable."
                        )
                );
    }

    private LocalDate resolveSleepDate(Instant wakeTime) {

        return wakeTime
                .atZone(clock.getZone())
                .toLocalDate();
    }

    private void validateRequest(SleepLogRequest request) {

        Instant bedtime = request.bedtime();
        Instant wakeTime = request.wakeTime();

        if (bedtime == null || wakeTime == null) {
            throw new InvalidRecoveryException(
                    "Les heures de coucher et de reveil "
                    + "sont obligatoires."
            );
        }

        Instant now = Instant.now(clock);

        if (bedtime.isAfter(now) || wakeTime.isAfter(now)) {
            throw new InvalidRecoveryException(
                    "Une nuit de sommeil ne peut pas "
                    + "etre enregistree dans le futur."
            );
        }

        if (!wakeTime.isAfter(bedtime)) {
            throw new InvalidRecoveryException(
                    "L'heure de reveil doit etre "
                    + "posterieure a l'heure de coucher."
            );
        }

        Duration duration = Duration.between(
                bedtime,
                wakeTime
        );

        if (duration.compareTo(Duration.ofHours(24)) > 0) {
            throw new InvalidRecoveryException(
                    "La duree du sommeil ne peut pas "
                    + "depasser 24 heures."
            );
        }

        Integer awakeMinutes = request.awakeMinutes();

        if (awakeMinutes != null &&
                (awakeMinutes < 0 ||
                 Duration.ofMinutes(awakeMinutes)
                         .compareTo(duration) > 0)) {

            throw new InvalidRecoveryException(
                    "Le temps passe eveille doit etre "
                    + "compris dans la duree totale de la nuit."
            );
        }

        Integer quality = request.sleepQuality();

        if (quality == null || quality < 1 || quality > 10) {
            throw new InvalidRecoveryException(
                    "La qualite du sommeil doit etre "
                    + "comprise entre 1 et 10."
            );
        }

        Integer awakenings = request.nightAwakenings();

        if (awakenings != null &&
                (awakenings < 0 || awakenings > 100)) {

            throw new InvalidRecoveryException(
                    "Le nombre de reveils nocturnes "
                    + "doit etre compris entre 0 et 100."
            );
        }
    }

    private void validateDateRange(
            LocalDate from,
            LocalDate to
    ) {

        if (from == null || to == null || from.isAfter(to)) {
            throw new InvalidRecoveryException(
                    "La periode de consultation est invalide."
            );
        }
    }
}
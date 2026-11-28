package com.fitcoach.recovery.service;

import com.fitcoach.recovery.domain.RecoverySettings;
import com.fitcoach.recovery.dto.RecoverySettingsRequest;
import com.fitcoach.recovery.dto.RecoverySettingsResponse;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent.ChangeType;
import com.fitcoach.recovery.exception.InvalidRecoveryException;
import com.fitcoach.recovery.repository.RecoverySettingsRepository;

import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecoverySettingsService {

    private final RecoverySettingsRepository settingsRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RecoverySettingsService(
            RecoverySettingsRepository settingsRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.settingsRepository = settingsRepository;
        this.eventPublisher = eventPublisher;
    }

    public RecoverySettingsResponse getSettings(UUID userId) {

        RecoverySettings settings = settingsRepository
                .findById(userId)
                .orElseGet(() -> new RecoverySettings(userId));

        return RecoverySettingsResponse.from(settings);
    }

    public int getSleepTargetMinutes(UUID userId) {

        return settingsRepository
                .findById(userId)
                .map(RecoverySettings::getSleepTargetMinutes)
                .orElse(
                        RecoverySettings.DEFAULT_SLEEP_TARGET_MINUTES
                );
    }

    @Transactional
    public RecoverySettingsResponse updateSettings(
            UUID userId,
            RecoverySettingsRequest request
    ) {

        Integer target = request.sleepTargetMinutes();

        if (target == null || target < 240 || target > 720) {

            throw new InvalidRecoveryException(
                    "L'objectif de sommeil doit etre compris "
                    + "entre 240 et 720 minutes."
            );
        }

        RecoverySettings settings = settingsRepository
                .findById(userId)
                .orElseGet(() -> new RecoverySettings(userId));

        int previousTarget =
                settings.getSleepTargetMinutes();

        settings.setSleepTargetMinutes(target);

        RecoverySettings saved =
                settingsRepository.saveAndFlush(settings);

        if (previousTarget != target) {

            eventPublisher.publishEvent(
                    new RecoveryDataChangedEvent(
                            userId,
                            null,
                            ChangeType.SETTINGS_CHANGED
                    )
            );
        }

        return RecoverySettingsResponse.from(saved);
    }
}
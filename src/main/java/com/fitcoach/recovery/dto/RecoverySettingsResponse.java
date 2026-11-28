package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.RecoverySettings;

import java.time.Instant;

public record RecoverySettingsResponse(

        int sleepTargetMinutes,
        Instant createdAt,
        Instant updatedAt

) {

    public static RecoverySettingsResponse from(
            RecoverySettings settings
    ) {
        return new RecoverySettingsResponse(
                settings.getSleepTargetMinutes(),
                settings.getCreatedAt(),
                settings.getUpdatedAt()
        );
    }
}
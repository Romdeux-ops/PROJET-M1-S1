package com.fitcoach.recovery.event;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * Evenement publie lorsqu'une modification de donnees
 * peut affecter les indicateurs de recuperation.
 */
public record RecoveryDataChangedEvent(

        UUID userId,

        LocalDate affectedFrom,

        ChangeType changeType

) {

    public RecoveryDataChangedEvent {

        Objects.requireNonNull(userId, "userId");

        Objects.requireNonNull(changeType, "changeType");

        if (changeType != ChangeType.SETTINGS_CHANGED) {
            Objects.requireNonNull(
                    affectedFrom,
                    "affectedFrom"
            );
        }
    }

    public enum ChangeType {

        SLEEP_CREATED,

        SLEEP_UPDATED,

        SLEEP_DELETED,

        CHECKIN_SAVED,

        CHECKIN_DELETED,

        SETTINGS_CHANGED,

        WORKOUT_DETAILS_SAVED,

        WORKOUT_DETAILS_DELETED
    }
}
package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.RecoveryCheckin;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RecoveryCheckinResponse(

        UUID id,
        LocalDate checkinDate,

        int energyLevel,
        int fatigueLevel,
        int stressLevel,
        int muscleSoreness,

        String notes,

        Instant createdAt,
        Instant updatedAt

) {

    public static RecoveryCheckinResponse from(
            RecoveryCheckin checkin
    ) {
        return new RecoveryCheckinResponse(
                checkin.getId(),
                checkin.getCheckinDate(),
                checkin.getEnergyLevel(),
                checkin.getFatigueLevel(),
                checkin.getStressLevel(),
                checkin.getMuscleSoreness(),
                checkin.getNotes(),
                checkin.getCreatedAt(),
                checkin.getUpdatedAt()
        );
    }
}
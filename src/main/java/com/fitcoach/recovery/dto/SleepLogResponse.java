package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.SleepLog;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SleepLogResponse(

        UUID id,
        LocalDate sleepDate,

        Instant bedtime,
        Instant wakeTime,

        long timeInBedMinutes,
        long estimatedSleepMinutes,
        boolean sleepDurationApproximate,

        Integer awakeMinutes,
        int sleepQuality,
        Integer nightAwakenings,

        String notes,

        Instant createdAt,
        Instant updatedAt

) {

    public static SleepLogResponse from(SleepLog sleepLog) {

        return new SleepLogResponse(
                sleepLog.getId(),
                sleepLog.getSleepDate(),
                sleepLog.getBedtime(),
                sleepLog.getWakeTime(),
                sleepLog.getTimeInBedMinutes(),
                sleepLog.getEstimatedSleepMinutes(),
                sleepLog.getAwakeMinutes() == null,
                sleepLog.getAwakeMinutes(),
                sleepLog.getSleepQuality(),
                sleepLog.getNightAwakenings(),
                sleepLog.getNotes(),
                sleepLog.getCreatedAt(),
                sleepLog.getUpdatedAt()
        );
    }
}
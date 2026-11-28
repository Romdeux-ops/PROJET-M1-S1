package com.fitcoach.recovery.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record SleepLogRequest(

        @NotNull
        @PastOrPresent
        Instant bedtime,

        @NotNull
        @PastOrPresent
        Instant wakeTime,

        @Min(0)
        @Max(1440)
        Integer awakeMinutes,

        @NotNull
        @Min(1)
        @Max(10)
        Integer sleepQuality,

        @Min(0)
        @Max(100)
        Integer nightAwakenings,

        @Size(max = 2000)
        String notes

) {}
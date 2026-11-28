package com.fitcoach.recovery.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RecoveryCheckinRequest(

        @NotNull
        @PastOrPresent
        LocalDate checkinDate,

        @NotNull
        @Min(0)
        @Max(10)
        Integer energyLevel,

        @NotNull
        @Min(0)
        @Max(10)
        Integer fatigueLevel,

        @NotNull
        @Min(0)
        @Max(10)
        Integer stressLevel,

        @NotNull
        @Min(0)
        @Max(10)
        Integer muscleSoreness,

        @Size(max = 2000)
        String notes

) {}
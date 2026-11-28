package com.fitcoach.recovery.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RecoverySettingsRequest(

        @NotNull
        @Min(240)
        @Max(720)
        Integer sleepTargetMinutes

) {}
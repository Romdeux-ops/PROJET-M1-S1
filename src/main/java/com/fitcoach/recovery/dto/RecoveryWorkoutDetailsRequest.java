package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.ActivityType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record RecoveryWorkoutDetailsRequest(

        ActivityType activityType,

        @DecimalMin("1.0")
        @DecimalMax("10.0")
        @Digits(integer = 2, fraction = 1)
        BigDecimal sessionRpe

) {}
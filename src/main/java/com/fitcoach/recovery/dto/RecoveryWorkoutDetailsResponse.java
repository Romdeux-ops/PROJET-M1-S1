package com.fitcoach.recovery.dto;

import com.fitcoach.recovery.domain.ActivityType;
import com.fitcoach.recovery.domain.RecoveryWorkoutDetails;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecoveryWorkoutDetailsResponse(

        UUID workoutSessionId,

        ActivityType activityType,
        BigDecimal sessionRpe,

        Instant createdAt,
        Instant updatedAt

) {

    public static RecoveryWorkoutDetailsResponse from(
            RecoveryWorkoutDetails details
    ) {
        return new RecoveryWorkoutDetailsResponse(
                details.getWorkoutSessionId(),
                details.getActivityType(),
                details.getSessionRpe(),
                details.getCreatedAt(),
                details.getUpdatedAt()
        );
    }
}
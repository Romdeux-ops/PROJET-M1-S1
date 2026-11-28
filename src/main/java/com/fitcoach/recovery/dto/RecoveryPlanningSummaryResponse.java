package com.fitcoach.recovery.dto;

import java.math.BigDecimal;

public record RecoveryPlanningSummaryResponse(

        int totalScheduledSessions,

        int elapsedScheduledSessions,

        int completedSessions,

        int pendingValidationSessions,

        int skippedSessions,

        int unconfirmedSessions,

        int futureScheduledSessions,

        int declaredCompletedSessions,

        BigDecimal adherencePercentage

) {}
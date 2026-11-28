package com.fitcoach.recovery.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record RecoveryOverviewResponse(

        LocalDate date,

        Instant generatedAt,

        String timeZone,

        // Informations du jour
        RecoveryAssessmentResponse todayAssessment,

        SleepLogResponse todaySleep,

        RecoveryCheckinResponse todayCheckin,

        RecoveryTrainingSummaryResponse todayTraining,

        RecoverySettingsResponse settings,

        // Statistiques
        RecoveryWeeklySummaryResponse weeklySummary,

        RecoveryWeightSummaryResponse weightSummary,

        // Graphiques
        List<RecoveryDailyTrendResponse> dailyTrends

) {

    public RecoveryOverviewResponse {
        dailyTrends = List.copyOf(dailyTrends);
    }
}
package com.fitcoach.recovery.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecoveryWeightSummaryResponse(

        BigDecimal currentWeightKg,

        LocalDate currentWeightMeasuredOn,

        BigDecimal referenceWeightKg,

        LocalDate referenceWeightMeasuredOn,

        BigDecimal weightChangeKg,

        BigDecimal weightChangePercentage,

        List<WeightPoint> history

) {

    public RecoveryWeightSummaryResponse {
        history = List.copyOf(history);
    }

    public record WeightPoint(

            LocalDate date,

            BigDecimal weightKg

    ) {}
}
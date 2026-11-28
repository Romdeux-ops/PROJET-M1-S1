package com.fitcoach.identity.dto;

import com.fitcoach.identity.domain.BodyWeightEntry;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BodyWeightResponse(

        UUID id,
        BigDecimal weightKg,
        LocalDate measuredOn,
        String note,
        Instant createdAt

) {

    public static BodyWeightResponse from(
            BodyWeightEntry entry
    ) {

        return new BodyWeightResponse(
                entry.getId(),
                entry.getWeightKg(),
                entry.getMeasuredOn(),
                entry.getNote(),
                entry.getCreatedAt()
        );
    }
}
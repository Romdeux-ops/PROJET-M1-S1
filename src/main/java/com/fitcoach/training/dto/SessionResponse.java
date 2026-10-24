package com.fitcoach.training.dto;

import com.fitcoach.training.domain.WorkoutSession;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        String title,
        Instant performedAt,
        Integer durationMinutes,
        String notes,
        UUID programId,
        UUID programDayId,
        List<SessionSetResponse> sets,
        BigDecimal totalVolume,
        Instant createdAt) {

    public static SessionResponse from(WorkoutSession session, List<SessionSetResponse> sets) {
        BigDecimal total = sets.stream().map(SessionSetResponse::volume).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new SessionResponse(
                session.getId(),
                session.getTitle(),
                session.getPerformedAt(),
                session.getDurationMinutes(),
                session.getNotes(),
                session.getProgramId(),
                session.getProgramDayId(),
                sets,
                total,
                session.getCreatedAt());
    }
}

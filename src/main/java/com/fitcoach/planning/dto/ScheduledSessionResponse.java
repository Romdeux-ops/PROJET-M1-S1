package com.fitcoach.planning.dto;

import com.fitcoach.planning.domain.ScheduledSession;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import java.time.LocalDate;
import java.util.UUID;

public record ScheduledSessionResponse(
        UUID id,
        String title,
        LocalDate scheduledDate,
        ScheduledSessionStatus status,
        UUID programId,
        UUID programDayId,
        UUID workoutSessionId,
        String notes,
        UUID athleteId,
        String athleteName) {

    public static ScheduledSessionResponse from(ScheduledSession session) {
        return from(session, null);
    }

    public static ScheduledSessionResponse from(ScheduledSession session, String athleteName) {
        return new ScheduledSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getScheduledDate(),
                session.getStatus(),
                session.getProgramId(),
                session.getProgramDayId(),
                session.getWorkoutSessionId(),
                session.getNotes(),
                session.getAthleteId(),
                athleteName);
    }
}

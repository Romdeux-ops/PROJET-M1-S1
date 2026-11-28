package com.fitcoach.planning.service;

import com.fitcoach.planning.api.AthletePlanning;
import com.fitcoach.planning.api.UpcomingSession;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import com.fitcoach.planning.repository.ScheduledSessionRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaAthletePlanning implements AthletePlanning {

    private final ScheduledSessionRepository scheduledSessionRepository;
    private final Clock clock;

    JpaAthletePlanning(
            ScheduledSessionRepository scheduledSessionRepository,
            Clock clock
    ) {
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.clock = clock;
    }

    @Override
    public int pendingValidationCount(UUID athleteId) {

        return (int) scheduledSessionRepository
                .countByAthleteIdAndStatus(
                        athleteId,
                        ScheduledSessionStatus.PENDING_VALIDATION
                );
    }

    @Override
    public List<UpcomingSession> upcoming(
            UUID athleteId,
            int limit
    ) {

        return scheduledSessionRepository
                .findByAthleteIdAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDate(
                        athleteId,
                        ScheduledSessionStatus.PLANNED,
                        LocalDate.now(clock),
                        PageRequest.of(0, limit)
                )
                .stream()
                .map(session -> new UpcomingSession(
                        session.getId(),
                        session.getTitle(),
                        session.getScheduledDate()
                ))
                .toList();
    }

    @Override
    public List<HistoricalSession> history(
            UUID athleteId,
            LocalDate from,
            LocalDate to
    ) {

        return scheduledSessionRepository
                .findByAthleteIdAndScheduledDateBetweenOrderByScheduledDate(
                        athleteId,
                        from,
                        to
                )
                .stream()
                .map(session -> new HistoricalSession(
                        session.getId(),
                        session.getTitle(),
                        session.getScheduledDate(),
                        toPublicStatus(session.getStatus()),
                        session.getWorkoutSessionId()
                ))
                .toList();
    }

    private SessionStatus toPublicStatus(
            ScheduledSessionStatus status
    ) {

        return switch (status) {
            case PLANNED -> SessionStatus.PLANNED;
            case PENDING_VALIDATION -> SessionStatus.PENDING_VALIDATION;
            case DONE -> SessionStatus.DONE;
            case SKIPPED -> SessionStatus.SKIPPED;
        };
    }
}
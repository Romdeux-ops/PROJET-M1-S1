package com.fitcoach.training.service;

import com.fitcoach.training.api.WorkoutActivity;
import com.fitcoach.training.domain.SessionSet;
import com.fitcoach.training.domain.WorkoutSession;
import com.fitcoach.training.repository.SessionSetRepository;
import com.fitcoach.training.repository.WorkoutSessionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class JpaWorkoutActivity implements WorkoutActivity {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final SessionSetRepository sessionSetRepository;

    public JpaWorkoutActivity(
            WorkoutSessionRepository workoutSessionRepository,
            SessionSetRepository sessionSetRepository
    ) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.sessionSetRepository = sessionSetRepository;
    }

    @Override
    public List<Session> sessionsBetween(
            UUID athleteId,
            Instant fromInclusive,
            Instant toExclusive
    ) {

        List<WorkoutSession> sessions =
                workoutSessionRepository
                    .findByAthleteIdAndPerformedAtGreaterThanEqualAndPerformedAtLessThanOrderByPerformedAtAsc(
                        athleteId,
                        fromInclusive,
                        toExclusive
                    );

        if (sessions.isEmpty()) {
            return List.of();
        }

        List<UUID> sessionIds = sessions.stream()
                .map(WorkoutSession::getId)
                .toList();

        Map<UUID, List<SessionSet>> setsBySession =
                sessionSetRepository
                    .findBySessionIdInOrderByPosition(sessionIds)
                    .stream()
                    .collect(Collectors.groupingBy(
                            SessionSet::getSessionId
                    ));

        return sessions.stream()
                .map(session -> toSession(
                        session,
                        setsBySession.getOrDefault(
                                session.getId(),
                                List.of()
                        )
                ))
                .toList();
    }

    @Override
    public Optional<Session> findSession(
            UUID athleteId,
            UUID workoutSessionId
    ) {

        return workoutSessionRepository
                .findByIdAndAthleteId(
                        workoutSessionId,
                        athleteId
                )
                .map(this::toSessionWithSets);
    }

    @Override
    public Optional<Session> lastSessionBefore(
            UUID athleteId,
            Instant beforeExclusive
    ) {

        return workoutSessionRepository
                .findFirstByAthleteIdAndPerformedAtLessThanOrderByPerformedAtDesc(
                        athleteId,
                        beforeExclusive
                )
                .map(this::toSessionWithSets);
    }

    private Session toSessionWithSets(
            WorkoutSession workoutSession
    ) {

        List<SessionSet> sets = sessionSetRepository
                .findBySessionIdInOrderByPosition(
                        List.of(workoutSession.getId())
                );

        return toSession(workoutSession, sets);
    }

    private Session toSession(
            WorkoutSession workoutSession,
            List<SessionSet> sets
    ) {

        List<BigDecimal> rpeValues = sets.stream()
                .map(SessionSet::getRpe)
                .filter(rpe -> rpe != null)
                .toList();

        BigDecimal averageRpe = calculateAverageRpe(
                rpeValues
        );

        return new Session(
                workoutSession.getId(),
                workoutSession.getTitle(),
                workoutSession.getPerformedAt(),
                workoutSession.getDurationMinutes(),
                averageRpe,
                sets.size(),
                rpeValues.size()
        );
    }

    private BigDecimal calculateAverageRpe(
            List<BigDecimal> rpeValues
    ) {

        if (rpeValues.isEmpty()) {
            return null;
        }

        BigDecimal sum = rpeValues.stream()
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return sum.divide(
                BigDecimal.valueOf(rpeValues.size()),
                2,
                RoundingMode.HALF_UP
        );
    }
}
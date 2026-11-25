package com.fitcoach.training.service;

import com.fitcoach.catalog.api.ExerciseCatalog;
import com.fitcoach.gamification.api.Achievements;
import com.fitcoach.program.api.ProgramAccess;
import com.fitcoach.training.domain.PersonalRecordMetric;
import com.fitcoach.training.domain.SessionSet;
import com.fitcoach.training.domain.WorkoutSession;
import com.fitcoach.training.dto.PersonalRecordResponse;
import com.fitcoach.training.dto.SessionRequest;
import com.fitcoach.training.dto.SessionResponse;
import com.fitcoach.training.dto.SessionSetRequest;
import com.fitcoach.training.dto.SessionSetResponse;
import com.fitcoach.training.exception.InvalidSessionExerciseException;
import com.fitcoach.training.exception.SessionInFutureException;
import com.fitcoach.training.exception.SessionNotFoundException;
import com.fitcoach.training.exception.SessionSetNotFoundException;
import com.fitcoach.training.repository.PersonalRecordRepository;
import com.fitcoach.training.repository.PersonalRecordView;
import com.fitcoach.training.repository.SessionSetRepository;
import com.fitcoach.training.repository.WorkoutSessionRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TrainingService {

    /** Tolere un leger decalage entre l'horloge du client et celle du serveur. */
    private static final Duration CLOCK_SKEW_TOLERANCE = Duration.ofMinutes(5);

    private final WorkoutSessionRepository sessionRepository;
    private final SessionSetRepository sessionSetRepository;
    private final PersonalRecordRepository personalRecordRepository;
    private final PersonalRecordService personalRecordService;
    private final ExerciseCatalog exerciseCatalog;
    private final Achievements achievements;
    private final ProgramAccess programAccess;
    private final Clock clock;

    public TrainingService(
            WorkoutSessionRepository sessionRepository,
            SessionSetRepository sessionSetRepository,
            PersonalRecordRepository personalRecordRepository,
            PersonalRecordService personalRecordService,
            ExerciseCatalog exerciseCatalog,
            Achievements achievements,
            ProgramAccess programAccess,
            Clock clock) {
        this.sessionRepository = sessionRepository;
        this.sessionSetRepository = sessionSetRepository;
        this.personalRecordRepository = personalRecordRepository;
        this.personalRecordService = personalRecordService;
        this.exerciseCatalog = exerciseCatalog;
        this.achievements = achievements;
        this.programAccess = programAccess;
        this.clock = clock;
    }

    public Page<SessionResponse> listSessions(UUID athleteId, Pageable pageable) {
        Page<WorkoutSession> page = sessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId, pageable);
        return new PageImpl<>(toResponses(athleteId, page.getContent()), pageable, page.getTotalElements());
    }

    public SessionResponse getSession(UUID sessionId, UUID athleteId) {
        return toResponse(findOwnedOrThrow(sessionId, athleteId));
    }

    @Transactional
    public SessionResponse createSession(UUID athleteId, SessionRequest request) {
        requireNotInFuture(request.performedAt());
        WorkoutSession session = new WorkoutSession(athleteId, request.title(), request.performedAt());
        applyFields(session, request);
        SessionResponse response = toResponse(sessionRepository.save(session));
        achievements.evaluate(athleteId);
        return response;
    }

    @Transactional
    public SessionResponse updateSession(UUID sessionId, UUID athleteId, SessionRequest request) {
        requireNotInFuture(request.performedAt());
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        applyFields(session, request);
        return toResponse(session);
    }

    @Transactional
    public void deleteSession(UUID sessionId, UUID athleteId) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        Set<UUID> exerciseIds = sessionSetRepository.findDistinctExerciseIdsBySessionId(session.getId());
        sessionRepository.delete(session);
        personalRecordService.recompute(athleteId, exerciseIds);
    }

    @Transactional
    public SessionResponse addSet(UUID sessionId, UUID athleteId, SessionSetRequest request) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        if (!exerciseCatalog.exists(request.exerciseId())) {
            throw new InvalidSessionExerciseException();
        }

        int position = sessionSetRepository.findMaxPositionBySessionId(session.getId()).orElse(-1) + 1;
        SessionSet set = new SessionSet(
                session.getId(), request.exerciseId(), position, request.setNumber(), request.reps(), request.weightKg());
        set.setRpe(request.rpe());
        set.setRestSeconds(request.restSeconds());
        sessionSetRepository.save(set);

        personalRecordService.recompute(athleteId, Set.of(request.exerciseId()));
        achievements.evaluate(athleteId);
        return toResponse(session);
    }

    @Transactional
    public SessionResponse deleteSet(UUID sessionId, UUID setId, UUID athleteId) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        SessionSet set = sessionSetRepository
                .findById(setId)
                .filter(s -> s.getSessionId().equals(session.getId()))
                .orElseThrow(SessionSetNotFoundException::new);
        sessionSetRepository.delete(set);
        personalRecordService.recompute(athleteId, Set.of(set.getExerciseId()));
        return toResponse(session);
    }

    public List<PersonalRecordResponse> listPersonalRecords(UUID athleteId) {
        List<PersonalRecordView> records = personalRecordRepository.findViewsByAthleteId(athleteId);
        Map<UUID, String> exerciseNames = exerciseCatalog.namesOf(
                records.stream().map(PersonalRecordView::exerciseId).collect(Collectors.toSet()));
        return records.stream()
                .map(r -> PersonalRecordResponse.from(r, exerciseNames.getOrDefault(r.exerciseId(), "")))
                .toList();
    }

    private void requireNotInFuture(Instant performedAt) {
        if (performedAt.isAfter(Instant.now(clock).plus(CLOCK_SKEW_TOLERANCE))) {
            throw new SessionInFutureException();
        }
    }

    private void applyFields(WorkoutSession session, SessionRequest request) {
        programAccess.assertCanUse(session.getAthleteId(), request.programId(), request.programDayId());
        session.setTitle(request.title());
        session.setPerformedAt(request.performedAt());
        session.setDurationMinutes(request.durationMinutes());
        session.setNotes(request.notes());
        session.setProgramId(request.programId());
        session.setProgramDayId(request.programDayId());
    }

    private WorkoutSession findOwnedOrThrow(UUID sessionId, UUID athleteId) {
        return sessionRepository
                .findById(sessionId)
                .filter(s -> s.isOwnedBy(athleteId))
                .orElseThrow(SessionNotFoundException::new);
    }

    private SessionResponse toResponse(WorkoutSession session) {
        return toResponses(session.getAthleteId(), List.of(session)).get(0);
    }

    /** Charge series, noms d'exercices et records en trois requetes, quelle que soit la taille de la page. */
    private List<SessionResponse> toResponses(UUID athleteId, List<WorkoutSession> sessions) {
        if (sessions.isEmpty()) {
            return List.of();
        }
        Map<UUID, List<SessionSet>> setsBySession = sessionSetRepository
                .findBySessionIdInOrderByPosition(sessions.stream().map(WorkoutSession::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(SessionSet::getSessionId));
        Map<UUID, String> exerciseNames = exerciseCatalog.namesOf(setsBySession.values().stream()
                .flatMap(List::stream)
                .map(SessionSet::getExerciseId)
                .collect(Collectors.toSet()));
        Set<UUID> recordSetIds =
                personalRecordRepository.findSessionSetIds(athleteId, PersonalRecordMetric.ESTIMATED_1RM);

        return sessions.stream()
                .map(session -> SessionResponse.from(
                        session,
                        setsBySession.getOrDefault(session.getId(), List.of()).stream()
                                .map(set -> SessionSetResponse.from(
                                        set,
                                        exerciseNames.getOrDefault(set.getExerciseId(), ""),
                                        recordSetIds.contains(set.getId())))
                                .toList()))
                .toList();
    }
}

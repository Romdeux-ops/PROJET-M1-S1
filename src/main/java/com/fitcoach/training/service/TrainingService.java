package com.fitcoach.training.service;

import com.fitcoach.catalog.domain.Exercise;
import com.fitcoach.catalog.repository.ExerciseRepository;
import com.fitcoach.training.domain.PersonalRecord;
import com.fitcoach.training.domain.PersonalRecordMetric;
import com.fitcoach.training.domain.SessionSet;
import com.fitcoach.training.domain.WorkoutSession;
import com.fitcoach.training.dto.PersonalRecordResponse;
import com.fitcoach.training.dto.SessionRequest;
import com.fitcoach.training.dto.SessionResponse;
import com.fitcoach.training.dto.SessionSetRequest;
import com.fitcoach.training.dto.SessionSetResponse;
import com.fitcoach.training.exception.InvalidSessionExerciseException;
import com.fitcoach.training.exception.SessionNotFoundException;
import com.fitcoach.training.exception.SessionSetNotFoundException;
import com.fitcoach.training.repository.PersonalRecordRepository;
import com.fitcoach.training.repository.SessionSetRepository;
import com.fitcoach.training.repository.WorkoutSessionRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainingService {

    private final WorkoutSessionRepository sessionRepository;
    private final SessionSetRepository sessionSetRepository;
    private final PersonalRecordRepository personalRecordRepository;
    private final ExerciseRepository exerciseRepository;

    public TrainingService(
            WorkoutSessionRepository sessionRepository,
            SessionSetRepository sessionSetRepository,
            PersonalRecordRepository personalRecordRepository,
            ExerciseRepository exerciseRepository) {
        this.sessionRepository = sessionRepository;
        this.sessionSetRepository = sessionSetRepository;
        this.personalRecordRepository = personalRecordRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public List<SessionResponse> listSessions(UUID athleteId) {
        return sessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId).stream()
                .map(this::toResponse)
                .toList();
    }

    public org.springframework.data.domain.Page<SessionResponse> listSessions(
            UUID athleteId, org.springframework.data.domain.Pageable pageable) {
        return sessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId, pageable).map(this::toResponse);
    }

    public SessionResponse getSession(UUID sessionId, UUID athleteId) {
        return toResponse(findOwnedOrThrow(sessionId, athleteId));
    }

    @Transactional
    public SessionResponse createSession(UUID athleteId, SessionRequest request) {
        WorkoutSession session = new WorkoutSession(athleteId, request.title(), request.performedAt());
        applyFields(session, request);
        session = sessionRepository.save(session);
        return toResponse(session);
    }

    @Transactional
    public SessionResponse updateSession(UUID sessionId, UUID athleteId, SessionRequest request) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        applyFields(session, request);
        return toResponse(session);
    }

    @Transactional
    public void deleteSession(UUID sessionId, UUID athleteId) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        sessionRepository.delete(session);
    }

    @Transactional
    public SessionResponse addSet(UUID sessionId, UUID athleteId, SessionSetRequest request) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(InvalidSessionExerciseException::new);

        int position = sessionSetRepository.findMaxPositionBySessionId(session.getId()).orElse(-1) + 1;
        SessionSet set = new SessionSet(
                session.getId(), exercise.getId(), position, request.setNumber(), request.reps(), request.weightKg());
        set.setRpe(request.rpe());
        set.setRestSeconds(request.restSeconds());
        set = sessionSetRepository.save(set);

        updatePersonalRecords(athleteId, set, session.getPerformedAt());

        return toResponse(session);
    }

    @Transactional
    public SessionResponse deleteSet(UUID sessionId, UUID setId, UUID athleteId) {
        WorkoutSession session = findOwnedOrThrow(sessionId, athleteId);
        SessionSet set = sessionSetRepository
                .findById(setId)
                .filter(s -> s.getSessionId().equals(session.getId()))
                .orElseThrow(SessionSetNotFoundException::new);
        List<PersonalRecord> affectedRecords = personalRecordRepository.findBySessionSetId(set.getId());
        sessionSetRepository.delete(set);
        for (PersonalRecord record : affectedRecords) {
            recomputeRecord(athleteId, record.getExerciseId(), record.getMetric());
        }
        return toResponse(session);
    }

    public List<PersonalRecordResponse> listPersonalRecords(UUID athleteId) {
        List<PersonalRecord> records = personalRecordRepository.findByAthleteIdOrderByExerciseId(athleteId);
        Map<UUID, String> exerciseNames = exerciseNamesFor(
                records.stream().map(PersonalRecord::getExerciseId).collect(Collectors.toSet()));
        return records.stream()
                .map(r -> PersonalRecordResponse.from(r, exerciseNames.getOrDefault(r.getExerciseId(), "")))
                .toList();
    }

    private void updatePersonalRecords(UUID athleteId, SessionSet set, Instant performedAt) {
        upsertRecord(athleteId, set, PersonalRecordMetric.MAX_WEIGHT, set.getWeightKg(), performedAt);
        upsertRecord(athleteId, set, PersonalRecordMetric.ESTIMATED_1RM, set.estimated1Rm(), performedAt);
    }

    private void upsertRecord(UUID athleteId, SessionSet set, PersonalRecordMetric metric, BigDecimal value, Instant performedAt) {
        PersonalRecord record = personalRecordRepository
                .findByAthleteIdAndExerciseIdAndMetric(athleteId, set.getExerciseId(), metric)
                .orElse(null);
        if (record == null) {
            personalRecordRepository.save(
                    new PersonalRecord(athleteId, set.getExerciseId(), metric, value, set.getId(), performedAt));
        } else if (value.compareTo(record.getValue()) > 0) {
            record.setValue(value);
            record.setSessionSetId(set.getId());
            record.setAchievedAt(performedAt);
        }
    }

    private void recomputeRecord(UUID athleteId, UUID exerciseId, PersonalRecordMetric metric) {
        List<WorkoutSession> sessions = sessionRepository.findByAthleteIdOrderByPerformedAtDesc(athleteId);
        Map<UUID, Instant> performedAtBySession =
                sessions.stream().collect(Collectors.toMap(WorkoutSession::getId, WorkoutSession::getPerformedAt));
        List<SessionSet> sets = sessionSetRepository.findByExerciseIdAndSessionIdIn(
                exerciseId, sessions.stream().map(WorkoutSession::getId).toList());

        SessionSet bestSet = null;
        BigDecimal bestValue = null;
        for (SessionSet candidate : sets) {
            BigDecimal candidateValue =
                    metric == PersonalRecordMetric.MAX_WEIGHT ? candidate.getWeightKg() : candidate.estimated1Rm();
            if (bestValue == null || candidateValue.compareTo(bestValue) > 0) {
                bestValue = candidateValue;
                bestSet = candidate;
            }
        }

        PersonalRecord record = personalRecordRepository
                .findByAthleteIdAndExerciseIdAndMetric(athleteId, exerciseId, metric)
                .orElse(null);
        if (bestSet == null) {
            if (record != null) {
                personalRecordRepository.delete(record);
            }
            return;
        }
        Instant achievedAt = performedAtBySession.get(bestSet.getSessionId());
        if (record == null) {
            personalRecordRepository.save(
                    new PersonalRecord(athleteId, exerciseId, metric, bestValue, bestSet.getId(), achievedAt));
        } else {
            record.setValue(bestValue);
            record.setSessionSetId(bestSet.getId());
            record.setAchievedAt(achievedAt);
        }
    }

    private void applyFields(WorkoutSession session, SessionRequest request) {
        session.setTitle(request.title());
        session.setPerformedAt(request.performedAt());
        session.setDurationMinutes(request.durationMinutes());
        session.setNotes(request.notes());
        session.setProgramId(request.programId());
        session.setProgramDayId(request.programDayId());
    }

    private WorkoutSession findOwnedOrThrow(UUID sessionId, UUID athleteId) {
        WorkoutSession session = sessionRepository.findById(sessionId).orElseThrow(SessionNotFoundException::new);
        if (!session.isOwnedBy(athleteId)) {
            throw new SessionNotFoundException();
        }
        return session;
    }

    private SessionResponse toResponse(WorkoutSession session) {
        List<SessionSet> sets = sessionSetRepository.findBySessionIdOrderByPosition(session.getId());
        Map<UUID, String> exerciseNames =
                exerciseNamesFor(sets.stream().map(SessionSet::getExerciseId).collect(Collectors.toSet()));

        List<SessionSetResponse> setResponses = sets.stream()
                .map(set -> SessionSetResponse.from(
                        set, exerciseNames.getOrDefault(set.getExerciseId(), ""), isPersonalRecord(session.getAthleteId(), set)))
                .toList();

        return SessionResponse.from(session, setResponses);
    }

    private boolean isPersonalRecord(UUID athleteId, SessionSet set) {
        return personalRecordRepository
                .findByAthleteIdAndExerciseIdAndMetric(athleteId, set.getExerciseId(), PersonalRecordMetric.ESTIMATED_1RM)
                .map(r -> set.getId().equals(r.getSessionSetId()))
                .orElse(false);
    }

    private Map<UUID, String> exerciseNamesFor(Set<UUID> exerciseIds) {
        if (exerciseIds.isEmpty()) {
            return Map.of();
        }
        return exerciseRepository.findAllById(exerciseIds).stream()
                .collect(Collectors.toMap(Exercise::getId, Exercise::getName));
    }
}

package com.fitcoach.planning.service;

import com.fitcoach.coaching.service.CoachingService;
import com.fitcoach.identity.dto.UserResponse;
import com.fitcoach.identity.repository.UserRepository;
import com.fitcoach.planning.domain.ScheduledSession;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import com.fitcoach.planning.dto.CompleteRequest;
import com.fitcoach.planning.dto.RescheduleRequest;
import com.fitcoach.planning.dto.ScheduleRequest;
import com.fitcoach.planning.dto.ScheduledSessionResponse;
import com.fitcoach.planning.exception.InvalidScheduledSessionStatusException;
import com.fitcoach.planning.exception.NotValidatingCoachException;
import com.fitcoach.planning.exception.ScheduledSessionNotFoundException;
import com.fitcoach.planning.repository.ScheduledSessionRepository;
import com.fitcoach.training.domain.WorkoutSession;
import com.fitcoach.training.exception.SessionNotFoundException;
import com.fitcoach.training.repository.WorkoutSessionRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlanningService {

    private final ScheduledSessionRepository scheduledSessionRepository;
    private final CoachingService coachingService;
    private final UserRepository userRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    public PlanningService(
            ScheduledSessionRepository scheduledSessionRepository,
            CoachingService coachingService,
            UserRepository userRepository,
            WorkoutSessionRepository workoutSessionRepository) {
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.coachingService = coachingService;
        this.userRepository = userRepository;
        this.workoutSessionRepository = workoutSessionRepository;
    }

    public List<ScheduledSessionResponse> listBetween(UUID athleteId, LocalDate from, LocalDate to) {
        return scheduledSessionRepository
                .findByAthleteIdAndScheduledDateBetweenOrderByScheduledDate(athleteId, from, to)
                .stream()
                .map(ScheduledSessionResponse::from)
                .toList();
    }

    public List<ScheduledSessionResponse> listToday(UUID athleteId) {
        return scheduledSessionRepository
                .findByAthleteIdAndScheduledDateOrderByCreatedAt(athleteId, LocalDate.now())
                .stream()
                .map(ScheduledSessionResponse::from)
                .toList();
    }

    @Transactional
    public ScheduledSessionResponse schedule(UUID athleteId, ScheduleRequest request) {
        ScheduledSession session = new ScheduledSession(athleteId, request.title(), request.scheduledDate());
        session.setProgramId(request.programId());
        session.setProgramDayId(request.programDayId());
        session.setNotes(request.notes());
        return ScheduledSessionResponse.from(scheduledSessionRepository.save(session));
    }

    @Transactional
    public ScheduledSessionResponse reschedule(UUID scheduledSessionId, UUID athleteId, RescheduleRequest request) {
        ScheduledSession session = findOwnedOrThrow(scheduledSessionId, athleteId);
        session.setScheduledDate(request.scheduledDate());
        if (session.getStatus() == ScheduledSessionStatus.SKIPPED) {
            session.setStatus(ScheduledSessionStatus.PLANNED);
        }
        return ScheduledSessionResponse.from(session);
    }

    @Transactional
    public ScheduledSessionResponse skip(UUID scheduledSessionId, UUID athleteId) {
        ScheduledSession session = findOwnedOrThrow(scheduledSessionId, athleteId);
        session.setStatus(ScheduledSessionStatus.SKIPPED);
        return ScheduledSessionResponse.from(session);
    }

    @Transactional
    public ScheduledSessionResponse complete(UUID scheduledSessionId, UUID athleteId, CompleteRequest request) {
        ScheduledSession session = findOwnedOrThrow(scheduledSessionId, athleteId);
        if (session.getStatus() != ScheduledSessionStatus.PLANNED) {
            throw new InvalidScheduledSessionStatusException(
                    "Seule une seance PLANIFIEE peut etre marquee comme terminee.");
        }
        if (request.workoutSessionId() != null) {
            WorkoutSession workoutSession = workoutSessionRepository
                    .findById(request.workoutSessionId())
                    .orElseThrow(SessionNotFoundException::new);
            if (!workoutSession.getAthleteId().equals(athleteId)) {
                throw new SessionNotFoundException();
            }
        }
        session.setWorkoutSessionId(request.workoutSessionId());
        boolean hasActiveCoach = !coachingService.listCoaches(athleteId).isEmpty();
        session.setStatus(hasActiveCoach ? ScheduledSessionStatus.PENDING_VALIDATION : ScheduledSessionStatus.DONE);
        return ScheduledSessionResponse.from(session);
    }

    public List<ScheduledSessionResponse> listPendingValidations(UUID coachId) {
        List<UUID> athleteIds =
                coachingService.listAthletes(coachId).stream().map(UserResponse::id).toList();
        if (athleteIds.isEmpty()) {
            return List.of();
        }
        return scheduledSessionRepository
                .findByAthleteIdInAndStatusOrderByScheduledDate(athleteIds, ScheduledSessionStatus.PENDING_VALIDATION)
                .stream()
                .map(session -> ScheduledSessionResponse.from(session, athleteNameOf(session.getAthleteId())))
                .toList();
    }

    @Transactional
    public ScheduledSessionResponse validate(UUID scheduledSessionId, UUID coachId) {
        ScheduledSession session = scheduledSessionRepository
                .findById(scheduledSessionId)
                .orElseThrow(ScheduledSessionNotFoundException::new);
        if (!coachingService.isActiveClient(coachId, session.getAthleteId())) {
            throw new NotValidatingCoachException();
        }
        if (session.getStatus() != ScheduledSessionStatus.PENDING_VALIDATION) {
            throw new InvalidScheduledSessionStatusException(
                    "Seule une seance en attente de validation peut etre validee.");
        }
        session.setStatus(ScheduledSessionStatus.DONE);
        return ScheduledSessionResponse.from(session, athleteNameOf(session.getAthleteId()));
    }

    @Transactional
    public void delete(UUID scheduledSessionId, UUID athleteId) {
        scheduledSessionRepository.delete(findOwnedOrThrow(scheduledSessionId, athleteId));
    }

    private String athleteNameOf(UUID athleteId) {
        return userRepository
                .findById(athleteId)
                .map(user -> user.getFirstName() + " " + user.getLastName())
                .orElse("");
    }

    private ScheduledSession findOwnedOrThrow(UUID scheduledSessionId, UUID athleteId) {
        ScheduledSession session = scheduledSessionRepository
                .findById(scheduledSessionId)
                .orElseThrow(ScheduledSessionNotFoundException::new);
        if (!session.isOwnedBy(athleteId)) {
            throw new ScheduledSessionNotFoundException();
        }
        return session;
    }
}

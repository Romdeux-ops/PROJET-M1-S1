package com.fitcoach.planning.service;

import com.fitcoach.coaching.api.CoachRelations;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.notification.api.NotificationType;
import com.fitcoach.notification.api.Notifier;
import com.fitcoach.planning.domain.ScheduledSession;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import com.fitcoach.planning.dto.CompleteRequest;
import com.fitcoach.planning.dto.RescheduleRequest;
import com.fitcoach.planning.dto.ScheduleRequest;
import com.fitcoach.planning.dto.ScheduledSessionResponse;
import com.fitcoach.planning.exception.InvalidDateRangeException;
import com.fitcoach.planning.exception.NotValidatingCoachException;
import com.fitcoach.planning.exception.ScheduledSessionNotFoundException;
import com.fitcoach.planning.exception.UnknownWorkoutSessionException;
import com.fitcoach.planning.repository.ScheduledSessionRepository;
import com.fitcoach.program.api.ProgramAccess;
import com.fitcoach.training.api.WorkoutSessions;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlanningService {

    /** Une annee bissextile complete : couvre toute vue calendrier sans autoriser un balayage illimite. */
    private static final int MAX_RANGE_DAYS = 366;

    private final ScheduledSessionRepository scheduledSessionRepository;
    private final CoachRelations coachRelations;
    private final UserDirectory userDirectory;
    private final WorkoutSessions workoutSessions;
    private final Notifier notifier;
    private final ProgramAccess programAccess;
    private final Clock clock;

    public PlanningService(
            ScheduledSessionRepository scheduledSessionRepository,
            CoachRelations coachRelations,
            UserDirectory userDirectory,
            WorkoutSessions workoutSessions,
            Notifier notifier,
            ProgramAccess programAccess,
            Clock clock) {
        this.scheduledSessionRepository = scheduledSessionRepository;
        this.coachRelations = coachRelations;
        this.userDirectory = userDirectory;
        this.workoutSessions = workoutSessions;
        this.notifier = notifier;
        this.programAccess = programAccess;
        this.clock = clock;
    }

    public List<ScheduledSessionResponse> listBetween(UUID athleteId, LocalDate from, LocalDate to) {
        if (to.isBefore(from) || ChronoUnit.DAYS.between(from, to) >= MAX_RANGE_DAYS) {
            throw new InvalidDateRangeException(MAX_RANGE_DAYS);
        }
        return scheduledSessionRepository
                .findByAthleteIdAndScheduledDateBetweenOrderByScheduledDate(athleteId, from, to)
                .stream()
                .map(ScheduledSessionResponse::from)
                .toList();
    }

    public List<ScheduledSessionResponse> listToday(UUID athleteId) {
        return scheduledSessionRepository
                .findByAthleteIdAndScheduledDateOrderByCreatedAt(athleteId, LocalDate.now(clock))
                .stream()
                .map(ScheduledSessionResponse::from)
                .toList();
    }

    @Transactional
    public ScheduledSessionResponse schedule(UUID athleteId, ScheduleRequest request) {
        programAccess.assertCanUse(athleteId, request.programId(), request.programDayId());
        ScheduledSession session = new ScheduledSession(athleteId, request.title(), request.scheduledDate());
        session.setProgramId(request.programId());
        session.setProgramDayId(request.programDayId());
        session.setNotes(request.notes());
        return ScheduledSessionResponse.from(scheduledSessionRepository.save(session));
    }

    @Transactional
    public ScheduledSessionResponse reschedule(UUID scheduledSessionId, UUID athleteId, RescheduleRequest request) {
        ScheduledSession session = findOwnedOrThrow(scheduledSessionId, athleteId);
        session.reschedule(request.scheduledDate());
        return ScheduledSessionResponse.from(session);
    }

    @Transactional
    public ScheduledSessionResponse skip(UUID scheduledSessionId, UUID athleteId) {
        ScheduledSession session = findOwnedOrThrow(scheduledSessionId, athleteId);
        session.skip();
        return ScheduledSessionResponse.from(session);
    }

    @Transactional
    public ScheduledSessionResponse complete(UUID scheduledSessionId, UUID athleteId, CompleteRequest request) {
        ScheduledSession session = findOwnedOrThrow(scheduledSessionId, athleteId);
        if (!workoutSessions.isOwnedBy(request.workoutSessionId(), athleteId)) {
            throw new UnknownWorkoutSessionException();
        }
        session.complete(request.workoutSessionId(), coachRelations.hasActiveCoach(athleteId));
        if (session.getStatus() == ScheduledSessionStatus.PENDING_VALIDATION) {
            notifyCoachesToValidate(session);
        }
        return ScheduledSessionResponse.from(session);
    }

    private void notifyCoachesToValidate(ScheduledSession session) {
        String athleteName = displayName(userDirectory.findById(session.getAthleteId()).orElse(null));
        String who = athleteName.isBlank() ? "Un athlète" : athleteName;
        for (UUID coachId : coachRelations.activeCoachIds(session.getAthleteId())) {
            notifier.notify(
                    coachId,
                    NotificationType.SESSION_PENDING_VALIDATION,
                    "Séance à valider",
                    who + " a terminé « " + session.getTitle() + " » : elle attend votre validation.",
                    "/coaching",
                    "pending-validation:" + session.getId() + ":" + coachId);
        }
    }

    public List<ScheduledSessionResponse> listPendingValidations(UUID coachId) {
        List<UUID> athleteIds = coachRelations.activeAthleteIds(coachId);
        if (athleteIds.isEmpty()) {
            return List.of();
        }
        Map<UUID, UserSummary> athletes = userDirectory.findAllById(athleteIds);
        return scheduledSessionRepository
                .findByAthleteIdInAndStatusOrderByScheduledDate(athleteIds, ScheduledSessionStatus.PENDING_VALIDATION)
                .stream()
                .map(session -> ScheduledSessionResponse.from(session, displayName(athletes.get(session.getAthleteId()))))
                .toList();
    }

    @Transactional
    public ScheduledSessionResponse validate(UUID scheduledSessionId, UUID coachId) {
        ScheduledSession session = scheduledSessionRepository
                .findById(scheduledSessionId)
                .orElseThrow(ScheduledSessionNotFoundException::new);
        if (!coachRelations.isActiveClient(coachId, session.getAthleteId())) {
            throw new NotValidatingCoachException();
        }
        session.validate();
        notifier.notify(
                session.getAthleteId(),
                NotificationType.SESSION_VALIDATED,
                "Séance validée",
                "Votre coach a validé « " + session.getTitle() + " ».",
                "/planning",
                "validated:" + session.getId());
        return ScheduledSessionResponse.from(
                session, displayName(userDirectory.findById(session.getAthleteId()).orElse(null)));
    }

    @Transactional
    public void delete(UUID scheduledSessionId, UUID athleteId) {
        scheduledSessionRepository.delete(findOwnedOrThrow(scheduledSessionId, athleteId));
    }

    private static String displayName(UserSummary user) {
        return user == null ? "" : user.displayName();
    }

    private ScheduledSession findOwnedOrThrow(UUID scheduledSessionId, UUID athleteId) {
        return scheduledSessionRepository
                .findById(scheduledSessionId)
                .filter(s -> s.isOwnedBy(athleteId))
                .orElseThrow(ScheduledSessionNotFoundException::new);
    }
}

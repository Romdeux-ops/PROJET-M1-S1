package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.domain.CoachAthleteStatus;
import com.fitcoach.coaching.dto.InvitationResponse;
import com.fitcoach.coaching.exception.InvitationConflictException;
import com.fitcoach.coaching.exception.RelationNotFoundException;
import com.fitcoach.coaching.repository.CoachAthleteRepository;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserNotFoundException;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.notification.api.NotificationType;
import com.fitcoach.notification.api.Notifier;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Demandes de suivi : un athlete demande, depuis le profil public d'un coach, a etre suivi ; le coach accepte
 * ou refuse. Seule l'acceptation ouvre des droits (la relation devient ACTIVE).
 */
@Service
@Transactional(readOnly = true)
public class FollowRequestService {

    private static final String COACHING_LINK = "/coaching";

    private final CoachAthleteRepository coachAthleteRepository;
    private final CoachProfileService profileService;
    private final UserDirectory userDirectory;
    private final Notifier notifier;

    public FollowRequestService(
            CoachAthleteRepository coachAthleteRepository,
            CoachProfileService profileService,
            UserDirectory userDirectory,
            Notifier notifier) {
        this.coachAthleteRepository = coachAthleteRepository;
        this.profileService = profileService;
        this.userDirectory = userDirectory;
        this.notifier = notifier;
    }

    @Transactional
    public InvitationResponse request(UUID athleteId, UUID coachId) {
        UserSummary coach = profileService.requirePublicCoach(coachId);
        UserSummary athlete = findUser(athleteId);

        // Une seule demande a la fois par paire : la suivante voit la relation creee et recoit 409.
        coachAthleteRepository.lockPair(pairLockKey(coachId, athleteId));
        CoachAthlete relation = coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athleteId)
                .orElse(null);
        if (relation == null) {
            relation = CoachAthlete.requestedBy(coachId, athleteId);
        } else if (relation.isActive()) {
            throw new InvitationConflictException("Vous etes deja suivi par ce coach.");
        } else if (relation.isPending()) {
            throw new InvitationConflictException("Ce coach vous a deja invite : acceptez son invitation.");
        } else if (relation.isRequested()) {
            throw new InvitationConflictException("Votre demande est deja en attente.");
        } else {
            relation.request();
        }
        try {
            coachAthleteRepository.saveAndFlush(relation);
        } catch (DataIntegrityViolationException e) {
            // Deux demandes simultanees (deux onglets) : la seconde se heurte a la cle (coach, athlete).
            throw new InvitationConflictException("Votre demande est deja en attente.");
        }

        notifier.notify(
                coachId,
                NotificationType.FOLLOW_REQUESTED,
                "Nouvelle demande de suivi",
                "Demande de suivi de " + athlete.displayName() + ".",
                COACHING_LINK,
                "follow-requested:" + athleteId + ":" + relation.getInvitedAt().toEpochMilli());
        return new InvitationResponse(coach, athlete, relation.getInvitedAt());
    }

    /**
     * L'athlete retire sa demande. Une relation deja connue (DECLINED, ENDED) retrouve son statut ; une relation
     * nee de la demande est supprimee. Dans les deux cas il pourra redemander.
     */
    @Transactional
    public void cancel(UUID athleteId, UUID coachId) {
        CoachAthlete relation = findRequested(coachId, athleteId);
        if (!relation.withdrawRequest()) {
            coachAthleteRepository.delete(relation);
        }
    }

    public List<InvitationResponse> listReceived(UUID coachId) {
        return toResponses(
                coachAthleteRepository.findByCoachIdAndStatusOrderByInvitedAtDesc(coachId, CoachAthleteStatus.REQUESTED),
                coachId);
    }

    public List<InvitationResponse> listSent(UUID athleteId) {
        return toResponses(
                coachAthleteRepository.findByAthleteIdAndStatusOrderByInvitedAtDesc(
                        athleteId, CoachAthleteStatus.REQUESTED),
                athleteId);
    }

    @Transactional
    public void accept(UUID coachId, UUID athleteId) {
        findRequested(coachId, athleteId).accept();
        notifier.notify(
                athleteId,
                NotificationType.FOLLOW_ACCEPTED,
                "Demande acceptee",
                findUser(coachId).displayName() + " a accepte de vous suivre.",
                COACHING_LINK,
                "follow-accepted:" + coachId + ":" + athleteId + ":" + Instant.now().toEpochMilli());
    }

    @Transactional
    public void decline(UUID coachId, UUID athleteId) {
        findRequested(coachId, athleteId).decline();
        notifier.notify(
                athleteId,
                NotificationType.FOLLOW_DECLINED,
                "Demande refusee",
                findUser(coachId).displayName() + " n'a pas donne suite a votre demande de suivi.",
                COACHING_LINK,
                "follow-declined:" + coachId + ":" + athleteId + ":" + Instant.now().toEpochMilli());
    }

    private CoachAthlete findRequested(UUID coachId, UUID athleteId) {
        return coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athleteId)
                .filter(CoachAthlete::isRequested)
                .orElseThrow(RelationNotFoundException::new);
    }

    private List<InvitationResponse> toResponses(List<CoachAthlete> relations, UUID viewerId) {
        Map<UUID, UserSummary> users = userDirectory.findAllById(Stream.concat(
                        Stream.of(viewerId),
                        relations.stream().flatMap(r -> Stream.of(r.getCoachId(), r.getAthleteId())))
                .distinct()
                .toList());
        return relations.stream()
                .filter(r -> users.containsKey(r.getCoachId()) && users.containsKey(r.getAthleteId()))
                .map(r -> new InvitationResponse(users.get(r.getCoachId()), users.get(r.getAthleteId()), r.getInvitedAt()))
                .toList();
    }

    /** Cle 64 bits du verrou consultatif d'une paire (coach, athlete), propre au module coaching. */
    private static long pairLockKey(UUID coachId, UUID athleteId) {
        return UUID.nameUUIDFromBytes(("coach-athlete:" + coachId + ":" + athleteId).getBytes(StandardCharsets.UTF_8))
                .getMostSignificantBits();
    }

    private UserSummary findUser(UUID userId) {
        return userDirectory.findById(userId).orElseThrow(UserNotFoundException::new);
    }
}

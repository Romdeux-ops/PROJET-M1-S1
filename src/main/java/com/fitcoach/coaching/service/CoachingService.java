package com.fitcoach.coaching.service;

import com.fitcoach.coaching.api.CoachRelations;
import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.domain.CoachAthleteStatus;
import com.fitcoach.coaching.dto.InvitationResponse;
import com.fitcoach.coaching.exception.InvalidAthleteException;
import com.fitcoach.coaching.exception.InvitationConflictException;
import com.fitcoach.coaching.exception.RelationNotFoundException;
import com.fitcoach.coaching.repository.CoachAthleteRepository;
import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserNotFoundException;
import com.fitcoach.identity.api.UserSummary;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CoachingService implements CoachRelations {

    private final CoachAthleteRepository coachAthleteRepository;
    private final UserDirectory userDirectory;

    public CoachingService(CoachAthleteRepository coachAthleteRepository, UserDirectory userDirectory) {
        this.coachAthleteRepository = coachAthleteRepository;
        this.userDirectory = userDirectory;
    }

    /** Le coach invite un athlete par email ; la relation reste PENDING tant que l'athlete n'a pas accepte. */
    @Transactional
    public InvitationResponse invite(UUID coachId, String athleteEmail) {
        UserSummary athlete = userDirectory
                .findByEmail(athleteEmail)
                .orElseThrow(() -> new InvalidAthleteException("Aucun compte ne correspond a " + athleteEmail));
        if (!athlete.hasRole(RoleCode.ATHLETE)) {
            throw new InvalidAthleteException(athleteEmail + " n'a pas le role ATHLETE.");
        }
        if (athlete.id().equals(coachId)) {
            throw new InvalidAthleteException("Un coach ne peut pas s'inviter lui-meme.");
        }

        CoachAthlete relation = coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athlete.id())
                .orElse(null);
        if (relation == null) {
            relation = new CoachAthlete(coachId, athlete.id());
        } else if (relation.isActive()) {
            throw new InvitationConflictException("Cet athlete fait deja partie de vos clients.");
        } else if (relation.isPending()) {
            throw new InvitationConflictException("Une invitation est deja en attente pour cet athlete.");
        } else if (relation.isRequested()) {
            throw new InvitationConflictException("Cet athlete a deja demande a etre suivi : acceptez sa demande.");
        } else {
            relation.invite();
        }
        coachAthleteRepository.save(relation);

        return new InvitationResponse(findUser(coachId), athlete, relation.getInvitedAt());
    }

    /** Invitations envoyees par le coach et pas encore repondues. */
    public List<InvitationResponse> listSentInvitations(UUID coachId) {
        List<CoachAthlete> pending =
                coachAthleteRepository.findByCoachIdAndStatusOrderByInvitedAtDesc(coachId, CoachAthleteStatus.PENDING);
        Map<UUID, UserSummary> users = userDirectory.findAllById(
                Stream.concat(Stream.of(coachId), pending.stream().map(CoachAthlete::getAthleteId)).toList());
        return pending.stream()
                .filter(relation -> users.containsKey(relation.getAthleteId()))
                .map(relation -> new InvitationResponse(
                        users.get(coachId), users.get(relation.getAthleteId()), relation.getInvitedAt()))
                .toList();
    }

    /** Invitations recues par l'athlete et pas encore repondues. */
    public List<InvitationResponse> listReceivedInvitations(UUID athleteId) {
        List<CoachAthlete> pending = coachAthleteRepository.findByAthleteIdAndStatusOrderByInvitedAtDesc(
                athleteId, CoachAthleteStatus.PENDING);
        Map<UUID, UserSummary> users = userDirectory.findAllById(
                Stream.concat(Stream.of(athleteId), pending.stream().map(CoachAthlete::getCoachId)).toList());
        return pending.stream()
                .filter(relation -> users.containsKey(relation.getCoachId()))
                .map(relation -> new InvitationResponse(
                        users.get(relation.getCoachId()), users.get(athleteId), relation.getInvitedAt()))
                .toList();
    }

    @Transactional
    public void acceptInvitation(UUID athleteId, UUID coachId) {
        findPending(coachId, athleteId).accept();
    }

    @Transactional
    public void declineInvitation(UUID athleteId, UUID coachId) {
        findPending(coachId, athleteId).decline();
    }

    /** Le coach retire une invitation encore en attente : la ligne disparait, il pourra reinviter. */
    @Transactional
    public void cancelInvitation(UUID coachId, UUID athleteId) {
        coachAthleteRepository.delete(findPending(coachId, athleteId));
    }

    /** Fin d'une relation active, a l'initiative du coach comme de l'athlete. */
    @Transactional
    public void endRelation(UUID coachId, UUID athleteId) {
        CoachAthlete relation = coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athleteId)
                .filter(CoachAthlete::isActive)
                .orElseThrow(RelationNotFoundException::new);
        relation.end();
    }

    private CoachAthlete findPending(UUID coachId, UUID athleteId) {
        return coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athleteId)
                .filter(CoachAthlete::isPending)
                .orElseThrow(RelationNotFoundException::new);
    }

    private UserSummary findUser(UUID userId) {
        return userDirectory.findById(userId).orElseThrow(UserNotFoundException::new);
    }

    @Override
    public boolean isActiveClient(UUID coachId, UUID athleteId) {
        return coachAthleteRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, CoachAthleteStatus.ACTIVE);
    }

    @Override
    public boolean hasActiveCoach(UUID athleteId) {
        return coachAthleteRepository.existsByAthleteIdAndStatus(athleteId, CoachAthleteStatus.ACTIVE);
    }

    @Override
    public List<UUID> activeAthleteIds(UUID coachId) {
        return coachAthleteRepository
                .findByCoachIdAndStatusOrderByCreatedAtDesc(coachId, CoachAthleteStatus.ACTIVE)
                .stream()
                .map(CoachAthlete::getAthleteId)
                .toList();
    }

    @Override
    public List<UUID> activeCoachIds(UUID athleteId) {
        return coachAthleteRepository
                .findByAthleteIdAndStatusOrderByCreatedAtDesc(athleteId, CoachAthleteStatus.ACTIVE)
                .stream()
                .map(CoachAthlete::getCoachId)
                .toList();
    }

    public List<UserSummary> listAthletes(UUID coachId) {
        return summariesInOrder(activeAthleteIds(coachId));
    }

    public List<UserSummary> listCoaches(UUID athleteId) {
        return summariesInOrder(activeCoachIds(athleteId));
    }

    private List<UserSummary> summariesInOrder(List<UUID> userIds) {
        Map<UUID, UserSummary> users = userDirectory.findAllById(userIds);
        return userIds.stream().map(users::get).filter(Objects::nonNull).toList();
    }
}

package com.fitcoach.coaching.service;

import com.fitcoach.coaching.api.CoachRelations;
import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.domain.CoachAthleteStatus;
import com.fitcoach.coaching.exception.InvalidAthleteException;
import com.fitcoach.coaching.repository.CoachAthleteRepository;
import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
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

    @Transactional
    public UserSummary addAthlete(UUID coachId, String athleteEmail) {
        UserSummary athlete = userDirectory
                .findByEmail(athleteEmail)
                .orElseThrow(() -> new InvalidAthleteException("Aucun compte ne correspond a " + athleteEmail));
        if (!athlete.hasRole(RoleCode.ATHLETE)) {
            throw new InvalidAthleteException(athleteEmail + " n'a pas le role ATHLETE.");
        }
        if (athlete.id().equals(coachId)) {
            throw new InvalidAthleteException("Un coach ne peut pas se rattacher lui-meme.");
        }

        CoachAthlete relation = coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athlete.id())
                .orElseGet(() -> new CoachAthlete(coachId, athlete.id()));
        relation.setStatus(CoachAthleteStatus.ACTIVE);
        coachAthleteRepository.save(relation);

        return athlete;
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

    public List<UserSummary> listAthletes(UUID coachId) {
        return summariesInOrder(activeAthleteIds(coachId));
    }

    public List<UserSummary> listCoaches(UUID athleteId) {
        List<UUID> coachIds = coachAthleteRepository
                .findByAthleteIdAndStatusOrderByCreatedAtDesc(athleteId, CoachAthleteStatus.ACTIVE)
                .stream()
                .map(CoachAthlete::getCoachId)
                .toList();
        return summariesInOrder(coachIds);
    }

    private List<UserSummary> summariesInOrder(List<UUID> userIds) {
        Map<UUID, UserSummary> users = userDirectory.findAllById(userIds);
        return userIds.stream().map(users::get).filter(Objects::nonNull).toList();
    }
}

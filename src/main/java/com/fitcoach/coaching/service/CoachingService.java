package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.exception.InvalidAthleteException;
import com.fitcoach.coaching.repository.CoachAthleteRepository;
import com.fitcoach.identity.domain.RoleCode;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.dto.UserResponse;
import com.fitcoach.identity.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CoachingService {

    private final CoachAthleteRepository coachAthleteRepository;
    private final UserRepository userRepository;

    public CoachingService(CoachAthleteRepository coachAthleteRepository, UserRepository userRepository) {
        this.coachAthleteRepository = coachAthleteRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse addAthlete(UUID coachId, String athleteEmail) {
        User athlete = userRepository
                .findByEmail(athleteEmail)
                .orElseThrow(() -> new InvalidAthleteException("Aucun compte ne correspond a " + athleteEmail));
        if (!athlete.hasRole(RoleCode.ATHLETE)) {
            throw new InvalidAthleteException(athleteEmail + " n'a pas le role ATHLETE.");
        }
        if (athlete.getId().equals(coachId)) {
            throw new InvalidAthleteException("Un coach ne peut pas se rattacher lui-meme.");
        }

        CoachAthlete relation = coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, athlete.getId())
                .orElseGet(() -> new CoachAthlete(coachId, athlete.getId()));
        relation.setStatus("ACTIVE");
        coachAthleteRepository.save(relation);

        return UserResponse.from(athlete);
    }

    @Transactional(readOnly = true)
    public boolean isActiveClient(UUID coachId, UUID athleteId) {
        return coachAthleteRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, "ACTIVE");
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAthletes(UUID coachId) {
        return coachAthleteRepository.findByCoachIdAndStatusOrderByCreatedAtDesc(coachId, "ACTIVE").stream()
                .map(relation -> userRepository.findById(relation.getAthleteId()).orElseThrow())
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listCoaches(UUID athleteId) {
        return coachAthleteRepository.findByAthleteIdAndStatusOrderByCreatedAtDesc(athleteId, "ACTIVE").stream()
                .map(relation -> userRepository.findById(relation.getCoachId()).orElseThrow())
                .map(UserResponse::from)
                .toList();
    }
}

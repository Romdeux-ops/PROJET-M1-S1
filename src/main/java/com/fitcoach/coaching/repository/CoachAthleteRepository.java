package com.fitcoach.coaching.repository;

import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.domain.CoachAthleteId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachAthleteRepository extends JpaRepository<CoachAthlete, CoachAthleteId> {

    Optional<CoachAthlete> findByCoachIdAndAthleteId(UUID coachId, UUID athleteId);

    boolean existsByCoachIdAndAthleteIdAndStatus(UUID coachId, UUID athleteId, String status);

    List<CoachAthlete> findByCoachIdAndStatusOrderByCreatedAtDesc(UUID coachId, String status);

    List<CoachAthlete> findByAthleteIdAndStatusOrderByCreatedAtDesc(UUID athleteId, String status);
}

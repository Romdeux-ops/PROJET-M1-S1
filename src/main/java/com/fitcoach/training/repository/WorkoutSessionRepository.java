package com.fitcoach.training.repository;

import com.fitcoach.training.domain.WorkoutSession;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    List<WorkoutSession> findByAthleteIdOrderByPerformedAtDesc(UUID athleteId);

    Page<WorkoutSession> findByAthleteIdOrderByPerformedAtDesc(UUID athleteId, Pageable pageable);
}

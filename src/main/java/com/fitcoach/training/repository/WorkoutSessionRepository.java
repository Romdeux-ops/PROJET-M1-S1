package com.fitcoach.training.repository;

import com.fitcoach.training.domain.WorkoutSession;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    Page<WorkoutSession> findByAthleteIdOrderByPerformedAtDesc(UUID athleteId, Pageable pageable);

    boolean existsByIdAndAthleteId(UUID id, UUID athleteId);
}

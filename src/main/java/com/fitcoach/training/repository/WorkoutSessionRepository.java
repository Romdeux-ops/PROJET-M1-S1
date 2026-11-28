package com.fitcoach.training.repository;

import com.fitcoach.training.domain.WorkoutSession;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    Page<WorkoutSession> findByAthleteIdOrderByPerformedAtDesc(UUID athleteId, Pageable pageable);

    boolean existsByIdAndAthleteId(UUID id, UUID athleteId);
    List<WorkoutSession>
        findByAthleteIdAndPerformedAtGreaterThanEqualAndPerformedAtLessThanOrderByPerformedAtAsc(
            UUID athleteId,
            Instant fromInclusive,
            Instant toExclusive
    );

    Optional<WorkoutSession> findByIdAndAthleteId(
            UUID id,
            UUID athleteId
    );

    Optional<WorkoutSession> findFirstByAthleteIdAndPerformedAtLessThanOrderByPerformedAtDesc(
            UUID athleteId,
            Instant beforeExclusive
    );
}

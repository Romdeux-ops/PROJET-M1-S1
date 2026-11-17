package com.fitcoach.planning.repository;

import com.fitcoach.planning.domain.ScheduledSession;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduledSessionRepository extends JpaRepository<ScheduledSession, UUID> {
    List<ScheduledSession> findByAthleteIdAndScheduledDateBetweenOrderByScheduledDate(
            UUID athleteId, LocalDate from, LocalDate to);

    List<ScheduledSession> findByAthleteIdAndScheduledDateOrderByCreatedAt(UUID athleteId, LocalDate date);

    List<ScheduledSession> findByAthleteIdInAndStatusOrderByScheduledDate(
            List<UUID> athleteIds, ScheduledSessionStatus status);

    long countByAthleteIdAndStatus(UUID athleteId, ScheduledSessionStatus status);

    List<ScheduledSession> findByAthleteIdAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDate(
            UUID athleteId, ScheduledSessionStatus status, LocalDate from, Pageable pageable);
}

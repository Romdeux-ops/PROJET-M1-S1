package com.fitcoach.training.repository;

import com.fitcoach.training.domain.SessionSet;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionSetRepository extends JpaRepository<SessionSet, UUID> {
    List<SessionSet> findBySessionIdOrderByPosition(UUID sessionId);

    int countBySessionId(UUID sessionId);

    List<SessionSet> findBySessionIdIn(List<UUID> sessionIds);

    List<SessionSet> findByExerciseIdAndSessionIdIn(UUID exerciseId, List<UUID> sessionIds);
}

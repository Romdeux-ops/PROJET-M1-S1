package com.fitcoach.training.repository;

import com.fitcoach.training.domain.SessionSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionSetRepository extends JpaRepository<SessionSet, UUID> {
    List<SessionSet> findBySessionIdInOrderByPosition(List<UUID> sessionIds);

    @Query("SELECT DISTINCT s.exerciseId FROM SessionSet s WHERE s.sessionId = :sessionId")
    Set<UUID> findDistinctExerciseIdsBySessionId(@Param("sessionId") UUID sessionId);

    @Query("SELECT MAX(s.position) FROM SessionSet s WHERE s.sessionId = :sessionId")
    Optional<Integer> findMaxPositionBySessionId(UUID sessionId);
}

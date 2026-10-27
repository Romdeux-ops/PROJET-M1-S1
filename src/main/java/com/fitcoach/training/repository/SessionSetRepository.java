package com.fitcoach.training.repository;

import com.fitcoach.training.domain.SessionSet;
import java.time.Instant;
import java.time.LocalDate;
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

    List<SessionSet> findBySessionIdIn(List<UUID> sessionIds);

    List<SessionSet> findByExerciseIdAndSessionIdIn(UUID exerciseId, List<UUID> sessionIds);

    @Query(
            value = "SELECT date_trunc('week', ws.performed_at)::date AS weekStart, "
                    + "SUM(ss.weight_kg * ss.reps) AS volume "
                    + "FROM session_sets ss "
                    + "JOIN workout_sessions ws ON ws.id = ss.session_id "
                    + "WHERE ws.athlete_id = :athleteId AND ws.performed_at >= :since "
                    + "GROUP BY weekStart "
                    + "ORDER BY weekStart",
            nativeQuery = true)
    List<WeeklyVolumeRow> aggregateWeeklyVolume(@Param("athleteId") UUID athleteId, @Param("since") Instant since);

    interface WeeklyVolumeRow {
        LocalDate getWeekStart();

        java.math.BigDecimal getVolume();
    }
}

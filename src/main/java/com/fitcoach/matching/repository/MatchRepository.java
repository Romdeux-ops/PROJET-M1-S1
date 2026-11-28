package com.fitcoach.matching.repository;

import com.fitcoach.matching.domain.Match;
import com.fitcoach.matching.domain.MatchStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    Optional<Match> findByCoachIdAndAthleteId(UUID coachId, UUID athleteId);

    boolean existsByCoachIdAndAthleteIdAndStatus(UUID coachId, UUID athleteId, MatchStatus status);

    /**
     * Cree le match de la paire s'il n'existe pas encore.
     *
     * @return 1 si le match vient d'etre cree, 0 s'il existait deja
     */
    @Modifying
    @Query(value = """
            INSERT INTO matches (coach_id, athlete_id) VALUES (:coachId, :athleteId)
            ON CONFLICT (coach_id, athlete_id) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(@Param("coachId") UUID coachId, @Param("athleteId") UUID athleteId);

    /** Matchs actifs de l'utilisateur, les plus recents d'abord. */
    @Query("""
            SELECT m FROM Match m
            WHERE (m.coachId = :userId OR m.athleteId = :userId)
              AND m.status = com.fitcoach.matching.domain.MatchStatus.ACTIVE
            ORDER BY m.createdAt DESC
            """)
    List<Match> findActiveForParticipant(@Param("userId") UUID userId);
}

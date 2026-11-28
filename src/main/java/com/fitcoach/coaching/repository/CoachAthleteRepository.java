package com.fitcoach.coaching.repository;

import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.domain.CoachAthleteId;
import com.fitcoach.coaching.domain.CoachAthleteStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CoachAthleteRepository extends JpaRepository<CoachAthlete, CoachAthleteId> {

    Optional<CoachAthlete> findByCoachIdAndAthleteId(UUID coachId, UUID athleteId);

    /**
     * Serialise jusqu'a la fin de la transaction les operations sur une meme paire
     * (coach, athlete). Sans ce verrou, deux demandes simultanees ne voient
     * aucune relation, et la seconde, sauvee par {@code merge}, relit la ligne
     * que la premiere vient de creer et la met a jour au lieu d'echouer.
     */
    @Query(value = "SELECT 1 FROM (SELECT pg_advisory_xact_lock(:key)) AS lock", nativeQuery = true)
    int lockPair(@Param("key") long key);

    boolean existsByCoachIdAndAthleteIdAndStatus(UUID coachId, UUID athleteId, CoachAthleteStatus status);

    boolean existsByAthleteIdAndStatus(UUID athleteId, CoachAthleteStatus status);

    List<CoachAthlete> findByCoachIdAndStatusOrderByCreatedAtDesc(UUID coachId, CoachAthleteStatus status);

    List<CoachAthlete> findByAthleteIdAndStatusOrderByCreatedAtDesc(UUID athleteId, CoachAthleteStatus status);

    List<CoachAthlete> findByCoachIdAndStatusOrderByInvitedAtDesc(UUID coachId, CoachAthleteStatus status);

    List<CoachAthlete> findByAthleteIdAndStatusOrderByInvitedAtDesc(UUID athleteId, CoachAthleteStatus status);
}

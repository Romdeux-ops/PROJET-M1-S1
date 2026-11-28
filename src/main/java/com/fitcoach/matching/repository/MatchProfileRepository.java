package com.fitcoach.matching.repository;

import com.fitcoach.matching.domain.MatchProfile;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchProfileRepository extends JpaRepository<MatchProfile, UUID> {

    /**
     * Profils visibles du camp {@code side} que {@code viewerId} n'a pas encore
     * swipes, sans ceux qui l'ont deja ecarte (le match est alors impossible).
     * Les plus recemment mis a jour d'abord ; le tri par score se fait ensuite.
     */
    @Query(value = """
            SELECT p.* FROM match_profiles p
            WHERE p.side = :side
              AND p.visible
              AND p.user_id <> :viewerId
              AND NOT EXISTS (
                  SELECT 1 FROM match_swipes s
                  WHERE s.swiper_id = :viewerId AND s.target_id = p.user_id)
              AND NOT EXISTS (
                  SELECT 1 FROM match_swipes s
                  WHERE s.swiper_id = p.user_id AND s.target_id = :viewerId AND s.decision = 'PASS')
            ORDER BY p.updated_at DESC
            LIMIT :poolSize
            """, nativeQuery = true)
    List<MatchProfile> findFeedCandidates(
            @Param("viewerId") UUID viewerId, @Param("side") String side, @Param("poolSize") int poolSize);
}

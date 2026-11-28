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
     *
     * <p>Le pool est borne : pour que les meilleurs profils y entrent meme
     * quand ils sont anciens, on prend d'abord ceux qui ont envoye un SUPER_LIKE,
     * puis ceux qui partagent le plus de sports ({@code sports} est un litteral
     * de tableau PostgreSQL), puis les plus recents. Le score exact est calcule
     * ensuite en Java.
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
            ORDER BY
              EXISTS (
                  SELECT 1 FROM match_swipes s
                  WHERE s.swiper_id = p.user_id AND s.target_id = :viewerId AND s.decision = 'SUPER_LIKE') DESC,
              cardinality(ARRAY(
                  SELECT unnest(p.sports) INTERSECT SELECT unnest(CAST(:sports AS text[])))) DESC,
              p.updated_at DESC
            LIMIT :poolSize
            """, nativeQuery = true)
    List<MatchProfile> findFeedCandidates(
            @Param("viewerId") UUID viewerId,
            @Param("side") String side,
            @Param("sports") String sports,
            @Param("poolSize") int poolSize);
}

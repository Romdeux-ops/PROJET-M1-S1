package com.fitcoach.matching.repository;

import com.fitcoach.matching.domain.MatchSwipe;
import com.fitcoach.matching.domain.MatchSwipeId;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchSwipeRepository extends JpaRepository<MatchSwipe, MatchSwipeId> {

    /** Enregistre la decision ; une nouvelle decision sur la meme personne remplace la precedente. */
    @Modifying
    @Query(value = """
            INSERT INTO match_swipes (swiper_id, target_id, decision) VALUES (:swiperId, :targetId, :decision)
            ON CONFLICT (swiper_id, target_id) DO UPDATE SET decision = EXCLUDED.decision, decided_at = now()
            """, nativeQuery = true)
    void upsert(@Param("swiperId") UUID swiperId, @Param("targetId") UUID targetId, @Param("decision") String decision);

    /** Vrai si {@code swiperId} a aime (LIKE ou SUPER_LIKE) {@code targetId}. */
    @Query(value = """
            SELECT EXISTS (
                SELECT 1 FROM match_swipes
                WHERE swiper_id = :swiperId AND target_id = :targetId AND decision IN ('LIKE', 'SUPER_LIKE'))
            """, nativeQuery = true)
    boolean hasLiked(@Param("swiperId") UUID swiperId, @Param("targetId") UUID targetId);

    /** Parmi {@code swiperIds}, ceux qui ont envoye un SUPER_LIKE a {@code targetId}. */
    @Query("""
            SELECT s.swiperId FROM MatchSwipe s
            WHERE s.targetId = :targetId AND s.swiperId IN :swiperIds
              AND s.decision = com.fitcoach.matching.domain.SwipeDecision.SUPER_LIKE
            """)
    List<UUID> findSuperLikers(@Param("targetId") UUID targetId, @Param("swiperIds") Collection<UUID> swiperIds);

    /**
     * Serialise jusqu'a la fin de la transaction les swipes d'une meme paire :
     * sans ce verrou, deux LIKE croises simultanes ne verraient chacun pas
     * l'autre (READ COMMITTED) et aucun match ne serait cree.
     */
    @Query(value = "SELECT 1 FROM (SELECT pg_advisory_xact_lock(:key)) AS lock", nativeQuery = true)
    int lockPair(@Param("key") long key);
}

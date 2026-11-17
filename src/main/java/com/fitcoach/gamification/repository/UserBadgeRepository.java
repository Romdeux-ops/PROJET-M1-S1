package com.fitcoach.gamification.repository;

import com.fitcoach.gamification.domain.UserBadge;
import com.fitcoach.gamification.domain.UserBadgeId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadgeId> {

    List<UserBadge> findByUserId(UUID userId);

    /**
     * Decerne le badge s'il ne l'est pas deja : l'insertion concurrente du meme
     * badge (deux requetes simultanees sur /me) ne leve alors aucune erreur.
     */
    @Modifying
    @Query(
            value = "INSERT INTO user_badges (user_id, badge_id) VALUES (:userId, :badgeId) ON CONFLICT DO NOTHING",
            nativeQuery = true)
    void awardIfAbsent(@Param("userId") UUID userId, @Param("badgeId") UUID badgeId);
}

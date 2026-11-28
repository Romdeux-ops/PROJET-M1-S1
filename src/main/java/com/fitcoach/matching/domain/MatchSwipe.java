package com.fitcoach.matching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Decision d'un utilisateur sur un profil (table {@code match_swipes}, V19).
 * Ecrite uniquement par l'upsert du depot ; l'entite ne sert qu'aux lectures.
 */
@Entity
@Table(name = "match_swipes")
@IdClass(MatchSwipeId.class)
public class MatchSwipe {

    @Id
    @Column(name = "swiper_id")
    private UUID swiperId;

    @Id
    @Column(name = "target_id")
    private UUID targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SwipeDecision decision;

    /** Date de la derniere decision : une nouvelle decision sur la meme personne la remplace. */
    @Column(name = "decided_at", nullable = false, insertable = false, updatable = false)
    private Instant decidedAt;

    protected MatchSwipe() {
        // JPA
    }

    public UUID getSwiperId() {
        return swiperId;
    }

    public UUID getTargetId() {
        return targetId;
    }

    public SwipeDecision getDecision() {
        return decision;
    }

    public Instant getDecidedAt() {
        return decidedAt;
    }
}

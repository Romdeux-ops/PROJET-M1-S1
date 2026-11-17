package com.fitcoach.gamification.dto;

import java.util.List;

/**
 * Progression de l'utilisateur : experience, niveau, bornes de XP du niveau
 * courant et du suivant (pour une barre de progression), et tous les badges.
 */
public record GamificationProfileResponse(
        long xp, int level, long levelStartXp, long nextLevelXp, List<BadgeResponse> badges) {}

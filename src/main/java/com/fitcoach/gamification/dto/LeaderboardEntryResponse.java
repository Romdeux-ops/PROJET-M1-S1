package com.fitcoach.gamification.dto;

import java.util.UUID;

public record LeaderboardEntryResponse(
        int rank, UUID userId, String displayName, long xp, int level, boolean you) {}

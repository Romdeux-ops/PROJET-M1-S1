package com.fitcoach.matching.dto;

import com.fitcoach.matching.domain.SwipeDecision;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/** {@code POST /api/matching/swipes}. */
public record SwipeRequest(@NotNull UUID targetId, @NotNull SwipeDecision decision) {}

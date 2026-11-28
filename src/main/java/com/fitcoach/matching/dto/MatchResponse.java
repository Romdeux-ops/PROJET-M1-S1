package com.fitcoach.matching.dto;

import com.fitcoach.matching.domain.MatchSide;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Match vu par l'un de ses deux membres : {@code counterpart*} decrit l'autre. */
public record MatchResponse(
        UUID id,
        UUID counterpartId,
        MatchSide counterpartSide,
        String counterpartFirstName,
        Integer counterpartAge,
        String counterpartAvatarUrl,
        String counterpartHeadline,
        List<String> counterpartSports,
        Instant createdAt) {}

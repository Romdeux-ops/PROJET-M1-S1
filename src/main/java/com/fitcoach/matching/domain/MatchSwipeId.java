package com.fitcoach.matching.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class MatchSwipeId implements Serializable {

    private UUID swiperId;
    private UUID targetId;

    public MatchSwipeId() {}

    public MatchSwipeId(UUID swiperId, UUID targetId) {
        this.swiperId = swiperId;
        this.targetId = targetId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MatchSwipeId that)) return false;
        return Objects.equals(swiperId, that.swiperId) && Objects.equals(targetId, that.targetId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(swiperId, targetId);
    }
}

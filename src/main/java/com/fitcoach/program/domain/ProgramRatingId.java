package com.fitcoach.program.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ProgramRatingId implements Serializable {

    private UUID programId;
    private UUID userId;

    public ProgramRatingId() {}

    public ProgramRatingId(UUID programId, UUID userId) {
        this.programId = programId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProgramRatingId that)) return false;
        return Objects.equals(programId, that.programId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(programId, userId);
    }
}

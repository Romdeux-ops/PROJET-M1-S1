package com.fitcoach.coaching.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CoachAthleteId implements Serializable {

    private UUID coachId;
    private UUID athleteId;

    public CoachAthleteId() {}

    public CoachAthleteId(UUID coachId, UUID athleteId) {
        this.coachId = coachId;
        this.athleteId = athleteId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CoachAthleteId that)) return false;
        return Objects.equals(coachId, that.coachId) && Objects.equals(athleteId, that.athleteId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(coachId, athleteId);
    }
}

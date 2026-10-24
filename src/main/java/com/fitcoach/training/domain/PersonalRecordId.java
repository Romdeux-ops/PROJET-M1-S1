package com.fitcoach.training.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class PersonalRecordId implements Serializable {

    private UUID athleteId;
    private UUID exerciseId;
    private PersonalRecordMetric metric;

    public PersonalRecordId() {}

    public PersonalRecordId(UUID athleteId, UUID exerciseId, PersonalRecordMetric metric) {
        this.athleteId = athleteId;
        this.exerciseId = exerciseId;
        this.metric = metric;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonalRecordId that)) return false;
        return Objects.equals(athleteId, that.athleteId)
                && Objects.equals(exerciseId, that.exerciseId)
                && metric == that.metric;
    }

    @Override
    public int hashCode() {
        return Objects.hash(athleteId, exerciseId, metric);
    }
}

package com.fitcoach.training.dto;

import com.fitcoach.training.domain.PersonalRecordMetric;
import com.fitcoach.training.repository.PersonalRecordView;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PersonalRecordResponse(
        UUID exerciseId, String exerciseName, PersonalRecordMetric metric, BigDecimal value, Instant achievedAt) {

    public static PersonalRecordResponse from(PersonalRecordView record, String exerciseName) {
        return new PersonalRecordResponse(
                record.exerciseId(), exerciseName, record.metric(), record.value(), record.achievedAt());
    }
}

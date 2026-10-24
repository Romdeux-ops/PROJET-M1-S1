package com.fitcoach.training.dto;

import com.fitcoach.training.domain.PersonalRecord;
import com.fitcoach.training.domain.PersonalRecordMetric;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PersonalRecordResponse(
        UUID exerciseId, String exerciseName, PersonalRecordMetric metric, BigDecimal value, Instant achievedAt) {

    public static PersonalRecordResponse from(PersonalRecord record, String exerciseName) {
        return new PersonalRecordResponse(
                record.getExerciseId(), exerciseName, record.getMetric(), record.getValue(), record.getAchievedAt());
    }
}

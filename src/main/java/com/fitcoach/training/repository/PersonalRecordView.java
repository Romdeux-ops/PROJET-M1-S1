package com.fitcoach.training.repository;

import com.fitcoach.training.domain.PersonalRecordMetric;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PersonalRecordView(UUID exerciseId, PersonalRecordMetric metric, BigDecimal value, Instant achievedAt) {}

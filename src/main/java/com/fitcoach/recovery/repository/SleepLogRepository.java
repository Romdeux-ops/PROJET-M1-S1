package com.fitcoach.recovery.repository;

import com.fitcoach.recovery.domain.SleepLog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SleepLogRepository
        extends JpaRepository<SleepLog, UUID> {

    Optional<SleepLog> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    Optional<SleepLog> findByUserIdAndSleepDate(
            UUID userId,
            LocalDate sleepDate
    );

    List<SleepLog>
        findByUserIdAndSleepDateBetweenOrderBySleepDateAsc(
            UUID userId,
            LocalDate from,
            LocalDate to
    );

    Optional<SleepLog>
        findFirstByUserIdOrderBySleepDateDesc(
            UUID userId
    );

    boolean existsByUserIdAndSleepDate(
            UUID userId,
            LocalDate sleepDate
    );
}
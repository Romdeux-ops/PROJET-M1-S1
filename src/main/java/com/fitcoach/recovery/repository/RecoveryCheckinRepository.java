package com.fitcoach.recovery.repository;

import com.fitcoach.recovery.domain.RecoveryCheckin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecoveryCheckinRepository
        extends JpaRepository<RecoveryCheckin, UUID> {

    Optional<RecoveryCheckin> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    Optional<RecoveryCheckin> findByUserIdAndCheckinDate(
            UUID userId,
            LocalDate checkinDate
    );

    List<RecoveryCheckin>
        findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc(
            UUID userId,
            LocalDate from,
            LocalDate to
    );

    Optional<RecoveryCheckin>
        findFirstByUserIdOrderByCheckinDateDesc(
            UUID userId
    );

    boolean existsByUserIdAndCheckinDate(
            UUID userId,
            LocalDate checkinDate
    );
}
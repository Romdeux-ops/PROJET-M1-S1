package com.fitcoach.identity.repository;

import com.fitcoach.identity.domain.BodyWeightEntry;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BodyWeightEntryRepository
        extends JpaRepository<BodyWeightEntry, UUID> {

    Optional<BodyWeightEntry> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    Optional<BodyWeightEntry> findByUserIdAndMeasuredOn(
            UUID userId,
            LocalDate measuredOn
    );

    Optional<BodyWeightEntry>
        findFirstByUserIdOrderByMeasuredOnDesc(
            UUID userId
    );

    Optional<BodyWeightEntry>
        findFirstByUserIdAndMeasuredOnLessThanEqualOrderByMeasuredOnDesc(
            UUID userId,
            LocalDate measuredOn
    );

    List<BodyWeightEntry>
        findByUserIdAndMeasuredOnBetweenOrderByMeasuredOnAsc(
            UUID userId,
            LocalDate from,
            LocalDate to
    );

    boolean existsByUserIdAndMeasuredOn(
            UUID userId,
            LocalDate measuredOn
    );
}
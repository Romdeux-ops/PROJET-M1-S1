package com.fitcoach.recovery.repository;

import com.fitcoach.recovery.domain.RecoveryAssessment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecoveryAssessmentRepository
        extends JpaRepository<RecoveryAssessment, UUID> {

    Optional<RecoveryAssessment> findByUserIdAndAssessmentDate(
            UUID userId,
            LocalDate assessmentDate
    );

    List<RecoveryAssessment>
        findByUserIdAndAssessmentDateBetweenOrderByAssessmentDateAsc(
            UUID userId,
            LocalDate from,
            LocalDate to
    );

    Optional<RecoveryAssessment>
        findFirstByUserIdOrderByAssessmentDateDesc(
            UUID userId
    );

    Optional<RecoveryAssessment>
        findFirstByUserIdAndAssessmentDateLessThanOrderByAssessmentDateDesc(
            UUID userId,
            LocalDate assessmentDate
    );

    List<RecoveryAssessment>
        findByUserIdAndAssessmentDateGreaterThanEqualOrderByAssessmentDateAsc(
            UUID userId,
            LocalDate assessmentDate
    );

    boolean existsByUserIdAndAssessmentDate(
            UUID userId,
            LocalDate assessmentDate
    );
}
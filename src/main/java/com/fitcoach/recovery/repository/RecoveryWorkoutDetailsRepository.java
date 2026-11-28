package com.fitcoach.recovery.repository;

import com.fitcoach.recovery.domain.RecoveryWorkoutDetails;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface RecoveryWorkoutDetailsRepository
        extends JpaRepository<RecoveryWorkoutDetails, UUID> {

    List<RecoveryWorkoutDetails> findByWorkoutSessionIdIn(
            Collection<UUID> workoutSessionIds
    );
}
package com.fitcoach.training.service;

import com.fitcoach.training.api.WorkoutSessions;
import com.fitcoach.training.repository.WorkoutSessionRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaWorkoutSessions implements WorkoutSessions {

    private final WorkoutSessionRepository workoutSessionRepository;

    JpaWorkoutSessions(WorkoutSessionRepository workoutSessionRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
    }

    @Override
    public boolean isOwnedBy(UUID workoutSessionId, UUID athleteId) {
        return workoutSessionRepository.existsByIdAndAthleteId(workoutSessionId, athleteId);
    }
}

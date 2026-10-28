package com.fitcoach.catalog.service;

import com.fitcoach.catalog.api.ExerciseCatalog;
import com.fitcoach.catalog.domain.Exercise;
import com.fitcoach.catalog.repository.ExerciseRepository;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaExerciseCatalog implements ExerciseCatalog {

    private final ExerciseRepository exerciseRepository;

    JpaExerciseCatalog(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public boolean exists(UUID exerciseId) {
        return exerciseRepository.existsById(exerciseId);
    }

    @Override
    public Map<UUID, String> namesOf(Collection<UUID> exerciseIds) {
        if (exerciseIds.isEmpty()) {
            return Map.of();
        }
        return exerciseRepository.findAllById(exerciseIds).stream()
                .collect(Collectors.toMap(Exercise::getId, Exercise::getName));
    }
}

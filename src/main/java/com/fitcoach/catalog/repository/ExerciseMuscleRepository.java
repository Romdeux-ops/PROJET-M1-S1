package com.fitcoach.catalog.repository;

import com.fitcoach.catalog.domain.ExerciseMuscle;
import com.fitcoach.catalog.domain.ExerciseMuscleId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseMuscleRepository extends JpaRepository<ExerciseMuscle, ExerciseMuscleId> {
    List<ExerciseMuscle> findByExerciseId(UUID exerciseId);

    void deleteByExerciseId(UUID exerciseId);
}

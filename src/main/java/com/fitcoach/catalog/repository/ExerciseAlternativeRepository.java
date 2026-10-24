package com.fitcoach.catalog.repository;

import com.fitcoach.catalog.domain.ExerciseAlternative;
import com.fitcoach.catalog.domain.ExerciseAlternativeId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseAlternativeRepository extends JpaRepository<ExerciseAlternative, ExerciseAlternativeId> {
    List<ExerciseAlternative> findByExerciseId(UUID exerciseId);

    void deleteByExerciseId(UUID exerciseId);
}

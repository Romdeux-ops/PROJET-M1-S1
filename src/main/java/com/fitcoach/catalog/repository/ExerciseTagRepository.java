package com.fitcoach.catalog.repository;

import com.fitcoach.catalog.domain.ExerciseTag;
import com.fitcoach.catalog.domain.ExerciseTagId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseTagRepository extends JpaRepository<ExerciseTag, ExerciseTagId> {
    List<ExerciseTag> findByExerciseId(UUID exerciseId);

    List<ExerciseTag> findByExerciseIdIn(List<UUID> exerciseIds);

    void deleteByExerciseId(UUID exerciseId);
}

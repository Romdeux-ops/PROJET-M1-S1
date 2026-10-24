package com.fitcoach.catalog.repository;

import com.fitcoach.catalog.domain.Exercise;
import com.fitcoach.catalog.domain.ExerciseDifficulty;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

    Optional<Exercise> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query(
            """
            SELECT DISTINCT e FROM Exercise e
            LEFT JOIN ExerciseMuscle em ON em.exerciseId = e.id
            LEFT JOIN ExerciseTag et ON et.exerciseId = e.id
            WHERE (:query = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')))
              AND (:muscleGroupId IS NULL OR em.muscleGroupId = :muscleGroupId)
              AND (:tagId IS NULL OR et.tagId = :tagId)
              AND (:difficulty IS NULL OR e.difficulty = :difficulty)
            ORDER BY e.name ASC
            """)
    List<Exercise> search(
            @Param("query") String query,
            @Param("muscleGroupId") UUID muscleGroupId,
            @Param("tagId") UUID tagId,
            @Param("difficulty") ExerciseDifficulty difficulty);
}

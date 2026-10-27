package com.fitcoach.program.repository;

import com.fitcoach.program.domain.ProgramExercise;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProgramExerciseRepository extends JpaRepository<ProgramExercise, UUID> {
    List<ProgramExercise> findByProgramDayIdOrderByPosition(UUID programDayId);

    int countByProgramDayId(UUID programDayId);

    @Query("SELECT MAX(e.position) FROM ProgramExercise e WHERE e.programDayId = :programDayId")
    Optional<Integer> findMaxPositionByProgramDayId(UUID programDayId);

    List<ProgramExercise> findByProgramDayIdInOrderByPosition(List<UUID> programDayIds);
}

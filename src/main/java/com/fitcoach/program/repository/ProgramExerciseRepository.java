package com.fitcoach.program.repository;

import com.fitcoach.program.domain.ProgramExercise;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramExerciseRepository extends JpaRepository<ProgramExercise, UUID> {
    List<ProgramExercise> findByProgramDayIdOrderByPosition(UUID programDayId);

    int countByProgramDayId(UUID programDayId);
}

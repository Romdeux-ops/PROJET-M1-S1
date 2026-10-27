package com.fitcoach.program.repository;

import com.fitcoach.program.domain.ProgramDay;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProgramDayRepository extends JpaRepository<ProgramDay, UUID> {
    List<ProgramDay> findByProgramIdOrderByPosition(UUID programId);

    int countByProgramId(UUID programId);

    @Query("SELECT MAX(d.position) FROM ProgramDay d WHERE d.programId = :programId")
    Optional<Integer> findMaxPositionByProgramId(UUID programId);

    List<ProgramDay> findByProgramIdInOrderByPosition(List<UUID> programIds);
}

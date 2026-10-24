package com.fitcoach.program.repository;

import com.fitcoach.program.domain.ProgramDay;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramDayRepository extends JpaRepository<ProgramDay, UUID> {
    List<ProgramDay> findByProgramIdOrderByPosition(UUID programId);

    int countByProgramId(UUID programId);
}

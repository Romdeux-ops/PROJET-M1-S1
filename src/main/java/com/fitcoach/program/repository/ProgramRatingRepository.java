package com.fitcoach.program.repository;

import com.fitcoach.program.domain.ProgramRating;
import com.fitcoach.program.domain.ProgramRatingId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramRatingRepository extends JpaRepository<ProgramRating, ProgramRatingId> {
    List<ProgramRating> findByProgramId(UUID programId);

    Optional<ProgramRating> findByProgramIdAndUserId(UUID programId, UUID userId);
}

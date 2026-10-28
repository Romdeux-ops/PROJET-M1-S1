package com.fitcoach.program.repository;

import com.fitcoach.program.domain.ProgramRating;
import com.fitcoach.program.domain.ProgramRatingId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProgramRatingRepository extends JpaRepository<ProgramRating, ProgramRatingId> {
    List<ProgramRating> findByProgramId(UUID programId);

    Optional<ProgramRating> findByProgramIdAndUserId(UUID programId, UUID userId);

    @Query(
            "SELECT r.programId AS programId, AVG(r.stars) AS average, COUNT(r) AS total "
                    + "FROM ProgramRating r WHERE r.programId IN :programIds GROUP BY r.programId")
    List<ProgramRatingAggregate> aggregateByProgramIdIn(List<UUID> programIds);

    interface ProgramRatingAggregate {
        UUID getProgramId();

        Double getAverage();

        Long getTotal();
    }
}

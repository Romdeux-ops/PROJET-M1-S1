package com.fitcoach.program.repository;

import com.fitcoach.program.domain.Program;
import com.fitcoach.program.domain.ProgramCategory;
import com.fitcoach.program.domain.ProgramLevel;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProgramRepository extends JpaRepository<Program, UUID> {

    Optional<Program> findByShareToken(String shareToken);

    @Query(
            """
            SELECT p FROM Program p
            WHERE (p.visibility = 'PUBLIC' OR p.ownerId = :viewerId)
              AND (:mineOnly = false OR p.ownerId = :viewerId)
              AND (:category IS NULL OR p.category = :category)
              AND (:level IS NULL OR p.level = :level)
            """)
    Page<Program> search(
            @Param("viewerId") UUID viewerId,
            @Param("mineOnly") boolean mineOnly,
            @Param("category") ProgramCategory category,
            @Param("level") ProgramLevel level,
            Pageable pageable);
}

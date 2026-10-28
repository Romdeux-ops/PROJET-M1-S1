package com.fitcoach.catalog.repository;

import com.fitcoach.catalog.domain.MuscleGroup;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MuscleGroupRepository extends JpaRepository<MuscleGroup, UUID> {
    List<MuscleGroup> findAllByIdIn(List<UUID> ids);
}

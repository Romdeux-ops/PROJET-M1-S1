package com.fitcoach.catalog.repository;

import com.fitcoach.catalog.domain.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, UUID> {
    List<Tag> findAllByIdIn(List<UUID> ids);
}

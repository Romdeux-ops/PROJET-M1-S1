package com.fitcoach.gamification.repository;

import com.fitcoach.gamification.domain.Badge;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, UUID> {

    List<Badge> findAllByOrderByPosition();
}

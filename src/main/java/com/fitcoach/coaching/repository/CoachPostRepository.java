package com.fitcoach.coaching.repository;

import com.fitcoach.coaching.domain.CoachPost;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachPostRepository extends JpaRepository<CoachPost, UUID> {

    List<CoachPost> findByCoachIdOrderByCreatedAtDesc(UUID coachId);
}

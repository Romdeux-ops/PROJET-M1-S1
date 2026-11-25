package com.fitcoach.coaching.repository;

import com.fitcoach.coaching.domain.CoachPublicProfile;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachPublicProfileRepository extends JpaRepository<CoachPublicProfile, UUID> {}

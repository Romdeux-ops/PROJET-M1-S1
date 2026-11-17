package com.fitcoach.coaching.repository;

import com.fitcoach.coaching.domain.CoachNote;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachNoteRepository extends JpaRepository<CoachNote, UUID> {

    Page<CoachNote> findByCoachIdAndAthleteIdOrderByCreatedAtDesc(UUID coachId, UUID athleteId, Pageable pageable);

    Optional<CoachNote> findByIdAndCoachIdAndAthleteId(UUID id, UUID coachId, UUID athleteId);
}

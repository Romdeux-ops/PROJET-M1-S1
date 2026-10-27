package com.fitcoach.training.repository;

import com.fitcoach.training.domain.PersonalRecord;
import com.fitcoach.training.domain.PersonalRecordId;
import com.fitcoach.training.domain.PersonalRecordMetric;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, PersonalRecordId> {
    List<PersonalRecord> findByAthleteIdOrderByExerciseId(UUID athleteId);

    Optional<PersonalRecord> findByAthleteIdAndExerciseIdAndMetric(
            UUID athleteId, UUID exerciseId, PersonalRecordMetric metric);

    List<PersonalRecord> findBySessionSetId(UUID sessionSetId);
}

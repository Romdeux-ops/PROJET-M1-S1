package com.fitcoach.training.repository;

import com.fitcoach.training.domain.PersonalRecord;
import com.fitcoach.training.domain.PersonalRecordId;
import com.fitcoach.training.domain.PersonalRecordMetric;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, PersonalRecordId> {

    @Query("""
            SELECT new com.fitcoach.training.repository.PersonalRecordView(
                pr.exerciseId, pr.metric, pr.value, ws.performedAt)
            FROM PersonalRecord pr
            JOIN SessionSet ss ON ss.id = pr.sessionSetId
            JOIN WorkoutSession ws ON ws.id = ss.sessionId
            WHERE pr.athleteId = :athleteId
            ORDER BY pr.exerciseId, pr.metric
            """)
    List<PersonalRecordView> findViewsByAthleteId(@Param("athleteId") UUID athleteId);

    @Query("SELECT pr.sessionSetId FROM PersonalRecord pr WHERE pr.athleteId = :athleteId AND pr.metric = :metric")
    Set<UUID> findSessionSetIds(@Param("athleteId") UUID athleteId, @Param("metric") PersonalRecordMetric metric);
}

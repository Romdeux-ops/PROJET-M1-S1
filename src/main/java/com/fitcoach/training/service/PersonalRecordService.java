package com.fitcoach.training.service;

import jakarta.persistence.EntityManager;
import java.util.Collection;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Maintient {@code personal_records} comme projection des series de l'athlete.
 *
 * <p>Le recalcul est entierement en SQL : rien n'est charge en memoire et la
 * table converge vers la meilleure serie quel que soit l'ordre des ajouts et
 * suppressions. Les records dont la serie disparait sont supprimes par la
 * cascade de la cle etrangere, avant d'etre recalcules ici.
 */
@Service
public class PersonalRecordService {

    private static final String LOCK_ATHLETE = "SELECT 1 FROM (SELECT pg_advisory_xact_lock(hashtextextended(:athleteId, 0))) l";

    private static final String UPSERT_BEST_SETS = """
            INSERT INTO personal_records (athlete_id, exercise_id, metric, value, session_set_id)
            SELECT DISTINCT ON (ss.exercise_id, m.metric)
                   ws.athlete_id, ss.exercise_id, m.metric, m.value, ss.id
            FROM session_sets ss
            JOIN workout_sessions ws ON ws.id = ss.session_id
            CROSS JOIN LATERAL (VALUES ('MAX_WEIGHT', ss.weight_kg), ('ESTIMATED_1RM', ss.estimated_1rm)) AS m (metric, value)
            WHERE ws.athlete_id = :athleteId AND ss.exercise_id IN (:exerciseIds)
            ORDER BY ss.exercise_id, m.metric, m.value DESC, ws.performed_at, ss.position, ss.id
            ON CONFLICT (athlete_id, exercise_id, metric)
            DO UPDATE SET value = EXCLUDED.value, session_set_id = EXCLUDED.session_set_id
            """;

    private final EntityManager entityManager;
    private final JdbcClient jdbcClient;

    public PersonalRecordService(EntityManager entityManager, JdbcClient jdbcClient) {
        this.entityManager = entityManager;
        this.jdbcClient = jdbcClient;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recompute(UUID athleteId, Collection<UUID> exerciseIds) {
        if (exerciseIds.isEmpty()) {
            return;
        }
        // Les series ajoutees ou supprimees via JPA doivent etre visibles du SQL.
        entityManager.flush();
        // Verrou par athlete, pris dans une requete distincte : en READ COMMITTED,
        // l'upsert suivant voit ainsi les series validees par une transaction
        // concurrente et ne peut pas ecraser un meilleur record par un moins bon.
        jdbcClient.sql(LOCK_ATHLETE).param("athleteId", athleteId.toString()).query().singleValue();
        jdbcClient.sql(UPSERT_BEST_SETS)
                .param("athleteId", athleteId)
                .param("exerciseIds", exerciseIds)
                .update();
    }
}

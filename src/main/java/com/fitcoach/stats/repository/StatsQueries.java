package com.fitcoach.stats.repository;

import com.fitcoach.stats.dto.ExerciseProgressionPoint;
import com.fitcoach.stats.dto.MuscleVolumeShare;
import com.fitcoach.stats.dto.WeeklyAdherencePoint;
import com.fitcoach.stats.dto.WeeklyVolumePoint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/**
 * Agregats en lecture seule sur les tables des modules training, planning et
 * catalog.
 *
 * <p>Les dates "locales" (jour, semaine ISO) sont calculees dans le fuseau
 * metier passe en parametre, jamais dans celui du serveur ou de la base. Les
 * bornes {@code from}/{@code to} sont des jours locaux inclusifs.
 */
@Repository
public class StatsQueries {

    private static final String LOCAL_DATE = "(ws.performed_at AT TIME ZONE :zone)::date";

    private static final String PERFORMED_BETWEEN = """
            ws.performed_at >= (CAST(:from AS date)::timestamp AT TIME ZONE :zone)
            AND ws.performed_at < ((CAST(:to AS date) + 1)::timestamp AT TIME ZONE :zone)
            """;

    private final JdbcClient jdbcClient;

    public StatsQueries(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public record DailyActivity(LocalDate date, int sessions, int minutes) {}

    public record VolumeComparison(BigDecimal recent, BigDecimal previous) {}

    public List<DailyActivity> dailyActivity(UUID athleteId, ZoneId zone, LocalDate from, LocalDate to) {
        return jdbcClient.sql("SELECT " + LOCAL_DATE + " AS date, COUNT(*)::int AS sessions,"
                        + " COALESCE(SUM(ws.duration_minutes), 0)::int AS minutes"
                        + " FROM workout_sessions ws"
                        + " WHERE ws.athlete_id = :athleteId AND " + PERFORMED_BETWEEN
                        + " GROUP BY 1 ORDER BY 1")
                .params(rangeParams(athleteId, zone, from, to))
                .query(DailyActivity.class)
                .list();
    }

    public double averageRpe(UUID athleteId, ZoneId zone, LocalDate from, LocalDate to) {
        return jdbcClient.sql("SELECT COALESCE(AVG(ss.rpe), 0)::float8"
                        + " FROM session_sets ss JOIN workout_sessions ws ON ws.id = ss.session_id"
                        + " WHERE ws.athlete_id = :athleteId AND " + PERFORMED_BETWEEN)
                .params(rangeParams(athleteId, zone, from, to))
                .query(Double.class)
                .single();
    }

    public List<ExerciseProgressionPoint> exerciseProgression(UUID athleteId, UUID exerciseId, ZoneId zone) {
        return jdbcClient.sql("SELECT " + LOCAL_DATE + " AS date, MAX(ss.weight_kg) AS max_weight,"
                        + " MAX(ss.estimated_1rm) AS estimated1rm"
                        + " FROM session_sets ss JOIN workout_sessions ws ON ws.id = ss.session_id"
                        + " WHERE ws.athlete_id = :athleteId AND ss.exercise_id = :exerciseId"
                        + " GROUP BY 1 ORDER BY 1")
                .param("athleteId", athleteId)
                .param("exerciseId", exerciseId)
                .param("zone", zone.getId())
                .query(ExerciseProgressionPoint.class)
                .list();
    }

    public List<WeeklyVolumePoint> weeklyVolume(UUID athleteId, ZoneId zone, LocalDate from, LocalDate to) {
        return jdbcClient.sql("SELECT date_trunc('week', " + LOCAL_DATE + ")::date AS week_start,"
                        + " SUM(ss.weight_kg * ss.reps) AS total_volume"
                        + " FROM session_sets ss JOIN workout_sessions ws ON ws.id = ss.session_id"
                        + " WHERE ws.athlete_id = :athleteId AND " + PERFORMED_BETWEEN
                        + " GROUP BY 1 ORDER BY 1")
                .params(rangeParams(athleteId, zone, from, to))
                .query(WeeklyVolumePoint.class)
                .list();
    }

    public List<MuscleVolumeShare> primaryMuscleVolume(UUID athleteId, ZoneId zone, LocalDate from, LocalDate to) {
        return jdbcClient.sql("SELECT mg.id AS muscle_group_id, mg.code AS muscle_group_code,"
                        + " mg.name AS muscle_group_name, SUM(ss.weight_kg * ss.reps) AS volume"
                        + " FROM session_sets ss"
                        + " JOIN workout_sessions ws ON ws.id = ss.session_id"
                        + " JOIN exercise_muscles em ON em.exercise_id = ss.exercise_id AND em.role = 'PRIMARY'"
                        + " JOIN muscle_groups mg ON mg.id = em.muscle_group_id"
                        + " WHERE ws.athlete_id = :athleteId AND " + PERFORMED_BETWEEN
                        + " GROUP BY mg.id, mg.code, mg.name ORDER BY volume DESC, mg.code")
                .params(rangeParams(athleteId, zone, from, to))
                .query(MuscleVolumeShare.class)
                .list();
    }

    /** Volume sur [recentFrom, to] compare a [previousFrom, recentFrom[. */
    public VolumeComparison volumeComparison(
            UUID athleteId, ZoneId zone, LocalDate previousFrom, LocalDate recentFrom, LocalDate to) {
        return jdbcClient.sql("SELECT"
                        + " COALESCE(SUM(ss.weight_kg * ss.reps) FILTER (WHERE " + LOCAL_DATE
                        + " >= :recentFrom), 0) AS recent,"
                        + " COALESCE(SUM(ss.weight_kg * ss.reps) FILTER (WHERE " + LOCAL_DATE
                        + " < :recentFrom), 0) AS previous"
                        + " FROM session_sets ss JOIN workout_sessions ws ON ws.id = ss.session_id"
                        + " WHERE ws.athlete_id = :athleteId AND " + PERFORMED_BETWEEN)
                .params(rangeParams(athleteId, zone, previousFrom, to))
                .param("recentFrom", recentFrom)
                .query(VolumeComparison.class)
                .single();
    }

    public List<WeeklyAdherencePoint> weeklyAdherence(UUID athleteId, LocalDate from, LocalDate to) {
        return jdbcClient.sql("""
                        SELECT date_trunc('week', sc.scheduled_date)::date AS week_start,
                               COUNT(*)::int AS planned,
                               (COUNT(*) FILTER (WHERE sc.status = 'DONE'))::int AS done,
                               (COUNT(*) FILTER (WHERE sc.status = 'SKIPPED'))::int AS skipped,
                               (COUNT(*) FILTER (WHERE sc.status = 'PENDING_VALIDATION'))::int AS pending
                        FROM scheduled_sessions sc
                        WHERE sc.athlete_id = :athleteId AND sc.scheduled_date BETWEEN :from AND :to
                        GROUP BY 1 ORDER BY 1
                        """)
                .param("athleteId", athleteId)
                .param("from", from)
                .param("to", to)
                .query(WeeklyAdherencePoint.class)
                .list();
    }

    /** Jours locaux distincts d'entrainement, du plus recent au plus ancien, bornes a {@code limit}. */
    /** Jours d'entrainement les plus recents jusqu'a {@code to} inclus ; les jours posterieurs sont ignores. */
    public List<LocalDate> recentTrainingDays(UUID athleteId, ZoneId zone, LocalDate to, int limit) {
        return jdbcClient.sql("SELECT DISTINCT " + LOCAL_DATE + " AS date FROM workout_sessions ws"
                        + " WHERE ws.athlete_id = :athleteId AND " + LOCAL_DATE + " <= :to"
                        + " ORDER BY 1 DESC LIMIT :limit")
                .param("athleteId", athleteId)
                .param("zone", zone.getId())
                .param("to", to)
                .param("limit", limit)
                .query(LocalDate.class)
                .list();
    }

    private static Map<String, Object> rangeParams(UUID athleteId, ZoneId zone, LocalDate from, LocalDate to) {
        return Map.of("athleteId", athleteId, "zone", zone.getId(), "from", from, "to", to);
    }
}

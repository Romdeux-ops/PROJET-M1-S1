package com.fitcoach.gamification.repository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/**
 * Faits d'entrainement dont derivent badges et experience, lus directement en
 * SQL sur les tables des modules training, planning et program (lecture seule,
 * comme {@code StatsQueries}).
 */
@Repository
public class GamificationQueries {

    /** Compteurs d'un athlete ; {@code records} compte les exercices ayant un record (pas les metriques). */
    public record Counters(long sessions, long sets, long records, long doneScheduled, long programs) {}

    /** Experience d'un utilisateur, pour le classement. */
    public record XpTotal(UUID userId, long xp) {}

    public static final int XP_PER_SESSION = 10;
    public static final int XP_PER_SET = 2;
    public static final int XP_PER_RECORD = 25;
    public static final int XP_PER_DONE_SCHEDULED = 15;

    private static final String XP_EXPRESSION = """
            (SELECT COUNT(*) FROM workout_sessions ws WHERE ws.athlete_id = u.id) * %d
          + (SELECT COUNT(*) FROM session_sets ss JOIN workout_sessions ws ON ws.id = ss.session_id
              WHERE ws.athlete_id = u.id) * %d
          + (SELECT COUNT(DISTINCT pr.exercise_id) FROM personal_records pr WHERE pr.athlete_id = u.id) * %d
          + (SELECT COUNT(*) FROM scheduled_sessions sc
              WHERE sc.athlete_id = u.id AND sc.status = 'DONE') * %d
            """.formatted(XP_PER_SESSION, XP_PER_SET, XP_PER_RECORD, XP_PER_DONE_SCHEDULED);

    private final JdbcClient jdbcClient;

    public GamificationQueries(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Counters counters(UUID userId) {
        return jdbcClient.sql("""
                        SELECT
                          (SELECT COUNT(*) FROM workout_sessions WHERE athlete_id = :id) AS sessions,
                          (SELECT COUNT(*) FROM session_sets ss JOIN workout_sessions ws ON ws.id = ss.session_id
                            WHERE ws.athlete_id = :id) AS sets,
                          (SELECT COUNT(DISTINCT exercise_id) FROM personal_records WHERE athlete_id = :id) AS records,
                          (SELECT COUNT(*) FROM scheduled_sessions
                            WHERE athlete_id = :id AND status = 'DONE') AS done_scheduled,
                          (SELECT COUNT(*) FROM programs WHERE owner_id = :id) AS programs
                        """)
                .param("id", userId)
                .query(Counters.class)
                .single();
    }

    /** Jours locaux distincts d'entrainement, du plus ancien au plus recent. */
    public List<LocalDate> trainingDays(UUID userId, ZoneId zone) {
        return jdbcClient.sql("SELECT DISTINCT (ws.performed_at AT TIME ZONE :zone)::date AS day"
                        + " FROM workout_sessions ws WHERE ws.athlete_id = :id ORDER BY 1")
                .param("id", userId)
                .param("zone", zone.getId())
                .query(LocalDate.class)
                .list();
    }

    public long xpOf(UUID userId) {
        return jdbcClient.sql("SELECT " + XP_EXPRESSION + " FROM users u WHERE u.id = :id")
                .param("id", userId)
                .query(Long.class)
                .single();
    }

    /** Rang d'un athlete ayant {@code xp} points : 1 + le nombre d'athletes strictement devant lui. */
    public long rankOf(long xp) {
        return jdbcClient.sql("SELECT COUNT(*) + 1 FROM ("
                        + " SELECT " + XP_EXPRESSION + " AS xp FROM users u"
                        + " JOIN user_roles ur ON ur.user_id = u.id"
                        + " WHERE ur.role_code = 'ATHLETE') t WHERE xp > :xp")
                .param("xp", xp)
                .query(Long.class)
                .single();
    }

    /** Les {@code limit} athletes ayant le plus d'experience (au moins 1 point), ex aequo departages par identifiant. */
    public List<XpTotal> topXp(int limit) {
        return jdbcClient.sql("SELECT id AS user_id, xp FROM ("
                        + " SELECT u.id, " + XP_EXPRESSION + " AS xp FROM users u"
                        + " JOIN user_roles ur ON ur.user_id = u.id"
                        + " WHERE ur.role_code = 'ATHLETE') t"
                        + " WHERE xp > 0 ORDER BY xp DESC, id LIMIT :limit")
                .param("limit", limit)
                .query(XpTotal.class)
                .list();
    }
}

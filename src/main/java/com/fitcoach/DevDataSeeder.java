package com.fitcoach;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Donnees de demonstration pour une installation locale (profil {@code dev}
 * uniquement). Idempotent : ne fait rien si le compte coach de demo existe.
 *
 * <p>Ecrit en SQL direct dans le package racine pour ne dependre d'aucun module
 * metier (frontieres verifiees par ArchitectureTest).
 */
@Component
@Profile("dev")
class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);
    private static final String COACH_EMAIL = "coach@fitcoach.dev";
    private static final String ATHLETE_EMAIL = "athlete@fitcoach.dev";
    private static final String DEMO_PASSWORD = "Password1";

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transaction;
    private final Clock clock;

    DevDataSeeder(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, TransactionTemplate transaction, Clock clock) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.transaction = transaction;
        this.clock = clock;
    }

    @Override
    public void run(ApplicationArguments args) {
        Integer existing = jdbc.queryForObject("SELECT count(*) FROM users WHERE email = ?", Integer.class, COACH_EMAIL);
        if (existing != null && existing > 0) {
            return;
        }
        transaction.executeWithoutResult(status -> seed());
        log.info("Donnees de demo creees : {} / {} (mot de passe {})", COACH_EMAIL, ATHLETE_EMAIL, DEMO_PASSWORD);
    }

    private void seed() {
        UUID coach = createUser(COACH_EMAIL, "Karim", "Coach", "COACH");
        UUID athlete = createUser(ATHLETE_EMAIL, "Lina", "Athlete", "ATHLETE");

        jdbc.update(
                "INSERT INTO coach_athlete (coach_id, athlete_id, status, responded_at) VALUES (?, ?, 'ACTIVE', now())",
                coach,
                athlete);

        UUID program = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO programs (id, owner_id, title, description, category, level, visibility, share_token)"
                        + " VALUES (?, ?, ?, ?, 'STRENGTH', 'BEGINNER', 'CLIENTS', ?)",
                program,
                coach,
                "Full body debutant (demo)",
                "Programme de demonstration visible par les athletes du coach.",
                UUID.randomUUID().toString().replace("-", ""));

        List<UUID> exercises = jdbc.queryForList(
                "SELECT id FROM exercises WHERE difficulty = 'BEGINNER' ORDER BY name LIMIT 8", UUID.class);
        UUID firstDay = null;
        for (int day = 0; day < 2; day++) {
            UUID dayId = UUID.randomUUID();
            if (day == 0) {
                firstDay = dayId;
            }
            jdbc.update(
                    "INSERT INTO program_days (id, program_id, position, name) VALUES (?, ?, ?, ?)",
                    dayId,
                    program,
                    day,
                    "Jour " + (day + 1));
            for (int i = 0; i < 4 && day * 4 + i < exercises.size(); i++) {
                jdbc.update(
                        "INSERT INTO program_exercises (program_day_id, exercise_id, position, sets, reps, rest_seconds)"
                                + " VALUES (?, ?, ?, 3, '10-12', 60)",
                        dayId,
                        exercises.get(day * 4 + i),
                        i);
            }
        }

        jdbc.update(
                "INSERT INTO scheduled_sessions (athlete_id, program_id, program_day_id, scheduled_date, title)"
                        + " VALUES (?, ?, ?, ?, ?)",
                athlete,
                program,
                firstDay,
                LocalDate.now(clock),
                "Full body debutant - Jour 1");
    }

    private UUID createUser(String email, String firstName, String lastName, String role) {
        UUID id = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
                id,
                email,
                passwordEncoder.encode(DEMO_PASSWORD),
                firstName,
                lastName);
        jdbc.update("INSERT INTO user_roles (user_id, role_code) VALUES (?, ?)", id, role);
        return id;
    }
}

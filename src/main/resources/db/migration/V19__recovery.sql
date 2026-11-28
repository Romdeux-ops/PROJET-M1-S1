-- =============================================================================
-- V19 : module Recovery
--
-- Suivi du sommeil, reserve energetique, preparation a l'entrainement
-- et informations complementaires des seances sportives.
--
-- Les scores sont des estimations calculees par le moteur Recovery.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Preferences de recuperation
-- -----------------------------------------------------------------------------

CREATE TABLE recovery_settings (
    user_id                 uuid PRIMARY KEY
                            REFERENCES users (id) ON DELETE CASCADE,

    sleep_target_minutes    integer NOT NULL DEFAULT 480
                            CHECK (
                                sleep_target_minutes BETWEEN 240 AND 720
                            ),

    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER recovery_settings_set_updated_at
    BEFORE UPDATE ON recovery_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 2. Journal du sommeil
--
-- sleep_date correspond au jour local du reveil.
-- La duree est calculee depuis les instants de coucher et de reveil.
-- -----------------------------------------------------------------------------

CREATE TABLE sleep_logs (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id                 uuid NOT NULL
                            REFERENCES users (id) ON DELETE CASCADE,

    sleep_date              date NOT NULL,

    bedtime                 timestamptz NOT NULL,
    wake_time               timestamptz NOT NULL,

    awake_minutes           integer
                            CHECK (
                                awake_minutes BETWEEN 0 AND 1440
                            ),

    sleep_quality           integer NOT NULL
                            CHECK (
                                sleep_quality BETWEEN 1 AND 10
                            ),

    night_awakenings        integer
                            CHECK (
                                night_awakenings BETWEEN 0 AND 100
                            ),

    notes                   text
                            CHECK (
                                notes IS NULL
                                OR char_length(notes) <= 2000
                            ),

    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_sleep_logs_user_date
        UNIQUE (user_id, sleep_date),

    CONSTRAINT chk_sleep_logs_times
        CHECK (
            wake_time > bedtime
            AND wake_time - bedtime <= INTERVAL '24 hours'
        ),

    CONSTRAINT chk_sleep_logs_awake_minutes
        CHECK (
            awake_minutes IS NULL
            OR awake_minutes * 60
                <= EXTRACT(EPOCH FROM (wake_time - bedtime))
        )
);

CREATE TRIGGER sleep_logs_set_updated_at
    BEFORE UPDATE ON sleep_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 3. Questionnaire quotidien de recuperation
--
-- Les indicateurs subjectifs utilisent une echelle de 0 a 10.
-- -----------------------------------------------------------------------------

CREATE TABLE recovery_checkins (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id                 uuid NOT NULL
                            REFERENCES users (id) ON DELETE CASCADE,

    checkin_date            date NOT NULL,

    energy_level            integer NOT NULL
                            CHECK (
                                energy_level BETWEEN 0 AND 10
                            ),

    fatigue_level           integer NOT NULL
                            CHECK (
                                fatigue_level BETWEEN 0 AND 10
                            ),

    stress_level            integer NOT NULL
                            CHECK (
                                stress_level BETWEEN 0 AND 10
                            ),

    muscle_soreness         integer NOT NULL
                            CHECK (
                                muscle_soreness BETWEEN 0 AND 10
                            ),

    notes                   text
                            CHECK (
                                notes IS NULL
                                OR char_length(notes) <= 2000
                            ),

    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_recovery_checkins_user_date
        UNIQUE (user_id, checkin_date)
);

CREATE TRIGGER recovery_checkins_set_updated_at
    BEFORE UPDATE ON recovery_checkins
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 4. Informations complementaires des seances
--
-- La duree, la date et le proprietaire sont recuperes depuis Training.
-- Aucun doublon des informations deja presentes dans workout_sessions.
-- -----------------------------------------------------------------------------

CREATE TABLE recovery_workout_details (
    workout_session_id      uuid PRIMARY KEY
                            REFERENCES workout_sessions (id)
                            ON DELETE CASCADE,

    activity_type           text
                            CHECK (
                                activity_type IN (
                                    'STRENGTH',
                                    'CARDIO',
                                    'HIIT',
                                    'RUNNING',
                                    'CYCLING',
                                    'WALKING',
                                    'SWIMMING',
                                    'YOGA',
                                    'STRETCHING',
                                    'OTHER'
                                )
                            ),

    session_rpe             numeric(3,1)
                            CHECK (
                                session_rpe BETWEEN 1 AND 10
                            ),

    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER recovery_workout_details_set_updated_at
    BEFORE UPDATE ON recovery_workout_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- 5. Evaluations quotidiennes
--
-- Les valeurs NULL representent des indicateurs non calculables.
-- Les scores sont des donnees derivees et peuvent etre recalcules.
-- -----------------------------------------------------------------------------

CREATE TABLE recovery_assessments (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id                 uuid NOT NULL
                            REFERENCES users (id) ON DELETE CASCADE,

    assessment_date         date NOT NULL,

    -- Scores principaux

    sleep_score             integer
                            CHECK (
                                sleep_score BETWEEN 0 AND 100
                            ),

    body_battery            integer
                            CHECK (
                                body_battery BETWEEN 0 AND 100
                            ),

    training_readiness      integer
                            CHECK (
                                training_readiness BETWEEN 0 AND 100
                            ),

    -- Activite sportive

    training_load           numeric(10,2)
                            CHECK (
                                training_load >= 0
                            ),

    recent_training_load    numeric(10,2)
                            CHECK (
                                recent_training_load >= 0
                            ),

    active_calories_kcal    numeric(10,2)
                            CHECK (
                                active_calories_kcal >= 0
                            ),

    -- Decomposition du Body Battery

    previous_body_battery   numeric(5,2)
                            CHECK (
                                previous_body_battery BETWEEN 0 AND 100
                            ),

    sleep_recharge          numeric(5,2)
                            CHECK (
                                sleep_recharge BETWEEN 0 AND 100
                            ),

    training_drain          numeric(10,2)
                            CHECK (
                                training_drain >= 0
                            ),

    stress_drain            numeric(5,2)
                            CHECK (
                                stress_drain >= 0
                            ),

    daily_drain             numeric(5,2)
                            CHECK (
                                daily_drain >= 0
                            ),

    -- Informations de calcul

    data_status             text NOT NULL DEFAULT 'INSUFFICIENT'
                            CHECK (
                                data_status IN (
                                    'COMPLETE',
                                    'PARTIAL',
                                    'INSUFFICIENT'
                                )
                            ),

    recommendation          text
                            CHECK (
                                recommendation IN (
                                    'NORMAL_TRAINING',
                                    'MODERATE_TRAINING',
                                    'LIGHT_ACTIVITY',
                                    'REST'
                                )
                            ),

    calculation_details     jsonb NOT NULL DEFAULT '{}'::jsonb
                            CHECK (
                                jsonb_typeof(calculation_details) = 'object'
                            ),

    algorithm_version       text NOT NULL DEFAULT '1.0',

    calculated_at           timestamptz NOT NULL DEFAULT now(),

    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_recovery_assessments_user_date
        UNIQUE (user_id, assessment_date)
);

CREATE TRIGGER recovery_assessments_set_updated_at
    BEFORE UPDATE ON recovery_assessments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
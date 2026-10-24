-- Phase 5 : carnet d'entrainement (seances realisees).

CREATE TABLE workout_sessions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id          uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    program_id          uuid REFERENCES programs (id) ON DELETE SET NULL,
    program_day_id      uuid REFERENCES program_days (id) ON DELETE SET NULL,
    title               text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
    performed_at        timestamptz NOT NULL,
    duration_minutes    integer CHECK (duration_minutes IS NULL OR duration_minutes BETWEEN 0 AND 600),
    notes               text CHECK (notes IS NULL OR char_length(notes) <= 2000),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_sessions_athlete ON workout_sessions (athlete_id, performed_at DESC);

CREATE TRIGGER workout_sessions_set_updated_at
    BEFORE UPDATE ON workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE session_sets (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      uuid NOT NULL REFERENCES workout_sessions (id) ON DELETE CASCADE,
    exercise_id     uuid NOT NULL REFERENCES exercises (id) ON DELETE RESTRICT,
    position        integer NOT NULL CHECK (position >= 0),
    set_number      integer NOT NULL CHECK (set_number >= 1),
    reps            integer NOT NULL CHECK (reps BETWEEN 1 AND 200),
    weight_kg       numeric(6, 2) NOT NULL CHECK (weight_kg >= 0),
    rpe             numeric(3, 1) CHECK (rpe IS NULL OR rpe BETWEEN 1 AND 10),
    rest_seconds    integer CHECK (rest_seconds IS NULL OR rest_seconds BETWEEN 0 AND 1200),
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (session_id, position)
);

CREATE INDEX idx_session_sets_exercise ON session_sets (exercise_id);

CREATE TABLE personal_records (
    athlete_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    exercise_id     uuid NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    metric          text NOT NULL CHECK (metric IN ('MAX_WEIGHT', 'ESTIMATED_1RM')),
    value           numeric(7, 2) NOT NULL,
    session_set_id  uuid NOT NULL REFERENCES session_sets (id) ON DELETE CASCADE,
    achieved_at     timestamptz NOT NULL,
    PRIMARY KEY (athlete_id, exercise_id, metric)
);

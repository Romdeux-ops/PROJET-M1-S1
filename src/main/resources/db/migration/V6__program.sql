-- Phase 4 : programmes d'entrainement et leur prescription.

CREATE TABLE programs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title           text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 150),
    description     text CHECK (description IS NULL OR char_length(description) <= 5000),
    category        text NOT NULL CHECK (category IN ('STRENGTH', 'CARDIO', 'HIIT', 'YOGA', 'STRETCHING')),
    level           text NOT NULL DEFAULT 'BEGINNER'
                        CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    visibility      text NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    share_token     text NOT NULL UNIQUE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER programs_set_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE program_days (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id      uuid NOT NULL REFERENCES programs (id) ON DELETE CASCADE,
    position        integer NOT NULL CHECK (position >= 0),
    name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    is_rest_day     boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    -- Differee pour permettre un reordonnancement en une transaction.
    UNIQUE (program_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TRIGGER program_days_set_updated_at
    BEFORE UPDATE ON program_days
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE program_exercises (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    program_day_id  uuid NOT NULL REFERENCES program_days (id) ON DELETE CASCADE,
    exercise_id     uuid NOT NULL REFERENCES exercises (id) ON DELETE RESTRICT,
    position        integer NOT NULL CHECK (position >= 0),
    sets            integer NOT NULL CHECK (sets BETWEEN 1 AND 20),
    reps            text NOT NULL CHECK (char_length(reps) BETWEEN 1 AND 20),
    rest_seconds    integer NOT NULL DEFAULT 90 CHECK (rest_seconds BETWEEN 0 AND 1200),
    notes           text CHECK (notes IS NULL OR char_length(notes) <= 1000),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    -- Differee pour permettre un reordonnancement en une transaction.
    UNIQUE (program_day_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TRIGGER program_exercises_set_updated_at
    BEFORE UPDATE ON program_exercises
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE program_ratings (
    program_id      uuid NOT NULL REFERENCES programs (id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    stars           integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment         text CHECK (comment IS NULL OR char_length(comment) <= 1000),
    created_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (program_id, user_id)
);

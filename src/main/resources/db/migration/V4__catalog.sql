-- Phase 3 : catalogue d'exercices.

CREATE TABLE muscle_groups (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text NOT NULL UNIQUE,
    name        text NOT NULL
);

CREATE TABLE tags (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text NOT NULL UNIQUE,
    name        text NOT NULL
);

CREATE TABLE exercises (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                    text NOT NULL UNIQUE,
    name                    text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 150),
    description             text CHECK (description IS NULL OR char_length(description) <= 5000),
    equipment               text,
    difficulty              text NOT NULL DEFAULT 'BEGINNER'
                                CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    default_rest_seconds    integer NOT NULL DEFAULT 90 CHECK (default_rest_seconds BETWEEN 0 AND 1200),
    media_url               text,
    created_by              uuid REFERENCES users (id) ON DELETE SET NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER exercises_set_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE exercise_muscles (
    exercise_id      uuid NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    muscle_group_id  uuid NOT NULL REFERENCES muscle_groups (id) ON DELETE CASCADE,
    role             text NOT NULL CHECK (role IN ('PRIMARY', 'SECONDARY')),
    PRIMARY KEY (exercise_id, muscle_group_id)
);

CREATE TABLE exercise_tags (
    exercise_id  uuid NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    tag_id       uuid NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, tag_id)
);

CREATE TABLE exercise_alternatives (
    exercise_id              uuid NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    alternative_exercise_id  uuid NOT NULL REFERENCES exercises (id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, alternative_exercise_id),
    CHECK (exercise_id <> alternative_exercise_id)
);

INSERT INTO muscle_groups (code, name) VALUES
    ('CHEST', 'Pectoraux'),
    ('BACK', 'Dos'),
    ('SHOULDERS', 'Epaules'),
    ('BICEPS', 'Biceps'),
    ('TRICEPS', 'Triceps'),
    ('FOREARMS', 'Avant-bras'),
    ('ABS', 'Abdominaux'),
    ('QUADS', 'Quadriceps'),
    ('HAMSTRINGS', 'Ischio-jambiers'),
    ('GLUTES', 'Fessiers'),
    ('CALVES', 'Mollets'),
    ('FULL_BODY', 'Corps entier');

INSERT INTO tags (code, name) VALUES
    ('PUSH', 'Poussee'),
    ('PULL', 'Tirage'),
    ('COMPOUND', 'Polyarticulaire'),
    ('ISOLATION', 'Isolation'),
    ('BODYWEIGHT', 'Poids du corps'),
    ('CARDIO', 'Cardio'),
    ('MOBILITY', 'Mobilite');

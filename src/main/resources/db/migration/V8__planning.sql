-- Phase 6 : planification des seances dans le calendrier.

CREATE TABLE scheduled_sessions (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id           uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    program_id           uuid REFERENCES programs (id) ON DELETE SET NULL,
    program_day_id       uuid REFERENCES program_days (id) ON DELETE SET NULL,
    workout_session_id   uuid REFERENCES workout_sessions (id) ON DELETE SET NULL,
    scheduled_date       date NOT NULL,
    status               text NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'DONE', 'SKIPPED')),
    title                text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
    notes                text CHECK (notes IS NULL OR char_length(notes) <= 1000),
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_sessions_athlete_date ON scheduled_sessions (athlete_id, scheduled_date);

CREATE TRIGGER scheduled_sessions_set_updated_at
    BEFORE UPDATE ON scheduled_sessions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

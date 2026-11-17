-- =============================================================================
-- V13 : phase 8, cycle d'invitation coach/athlete et notes de suivi
--
-- Jusqu'ici (V3) une relation naissait directement ACTIVE. Elle nait
-- desormais PENDING : l'athlete l'accepte (ACTIVE) ou la refuse (DECLINED).
-- Seul ACTIVE ouvre des droits d'acces (posts, validation, reservation,
-- messagerie).
-- =============================================================================

ALTER TABLE coach_athlete DROP CONSTRAINT coach_athlete_status_check;
ALTER TABLE coach_athlete
    ADD CONSTRAINT coach_athlete_status_check
        CHECK (status IN ('PENDING', 'ACTIVE', 'DECLINED', 'ENDED'));
ALTER TABLE coach_athlete ALTER COLUMN status SET DEFAULT 'PENDING';

-- Date d'envoi de la derniere invitation et de la reponse de l'athlete.
ALTER TABLE coach_athlete ADD COLUMN invited_at   timestamptz NOT NULL DEFAULT now();
ALTER TABLE coach_athlete ADD COLUMN responded_at timestamptz;

UPDATE coach_athlete SET invited_at = created_at, responded_at = created_at WHERE status = 'ACTIVE';

CREATE INDEX idx_coach_athlete_coach_status ON coach_athlete (coach_id, status);
CREATE INDEX idx_coach_athlete_athlete_status ON coach_athlete (athlete_id, status);


-- -----------------------------------------------------------------------------
-- Notes privees d'un coach sur un athlete.
--
-- Jamais visibles de l'athlete : lecture reservee a l'auteur. Pas de cle
-- etrangere vers coach_athlete, pour que le coach garde son historique de
-- notes une fois la relation terminee (la creation et la modification exigent
-- en revanche une relation ACTIVE, voir CoachNoteService).
-- -----------------------------------------------------------------------------
CREATE TABLE coach_notes (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    athlete_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_coach_notes_distinct CHECK (coach_id <> athlete_id)
);

CREATE INDEX idx_coach_notes_coach_athlete_created ON coach_notes (coach_id, athlete_id, created_at DESC);

CREATE TRIGGER trg_coach_notes_updated_at
    BEFORE UPDATE ON coach_notes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

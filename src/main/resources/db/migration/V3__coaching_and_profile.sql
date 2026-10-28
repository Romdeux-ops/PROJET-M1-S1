-- =============================================================================
-- V3 : relation coach-athlete et publications de profil
--
-- La relation coach_athlete est normalement prevue en phase 8, mais elle est
-- necessaire des la phase 2 pour restreindre la visibilite des publications
-- d'un coach a ses seuls clients. Le flux d'invitation complet (PENDING,
-- refus, etc.) reste a construire en phase 8 : pour l'instant un coach
-- rattache directement un athlete existant, la relation naissant ACTIVE.
-- =============================================================================

CREATE TABLE coach_athlete (
    coach_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    athlete_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status     text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ENDED')),
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (coach_id, athlete_id),
    CONSTRAINT chk_coach_athlete_distinct CHECK (coach_id <> athlete_id)
);

CREATE INDEX idx_coach_athlete_athlete ON coach_athlete (athlete_id);


-- -----------------------------------------------------------------------------
-- Publications d'un coach sur son profil.
--
-- Lecture reservee au coach lui-meme et a ses athletes actifs (voir
-- CoachPostService) : ce n'est pas un mur public.
-- -----------------------------------------------------------------------------
CREATE TABLE coach_posts (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
    image_url  text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_posts_coach_created ON coach_posts (coach_id, created_at DESC);

CREATE TRIGGER trg_coach_posts_updated_at
    BEFORE UPDATE ON coach_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- V19 : FitMatch, rencontres sportives entre athletes et coachs
--
-- Un utilisateur cree un profil de rencontre (sports, disponibilites, ville,
-- tarif ou budget), puis "swipe" les profils du camp oppose : un athlete ne
-- voit que des coachs et inversement. Deux LIKE reciproques forment un match,
-- qui ouvre la messagerie entre les deux personnes sans creer de relation de
-- coaching : celle-ci reste une decision explicite du coach.
--
-- Les donnees deja connues du compte (prenom, date de naissance, taille,
-- objectif, niveau, photo) ne sont pas recopiees ici : elles sont lues dans
-- users, qui reste leur seule source.
-- =============================================================================

CREATE TABLE match_profiles (
    user_id          uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    side             text NOT NULL CHECK (side IN ('ATHLETE', 'COACH')),
    headline         text NOT NULL CHECK (char_length(headline) BETWEEN 1 AND 120),
    about            text CHECK (char_length(about) <= 1000),
    sports           text[] NOT NULL CHECK (cardinality(sports) BETWEEN 1 AND 8),
    -- Coach : objectifs et niveaux pris en charge. Athlete : vides, son
    -- objectif et son niveau sont ceux de son compte.
    goals            text[] NOT NULL DEFAULT '{}',
    levels           text[] NOT NULL DEFAULT '{}',
    availability     text[] NOT NULL CHECK (cardinality(availability) BETWEEN 1 AND 4),
    training_mode    text NOT NULL CHECK (training_mode IN ('ONSITE', 'REMOTE', 'BOTH')),
    city             text CHECK (char_length(city) <= 80),
    -- Athlete : budget maximal par seance. Coach : tarif par seance. En euros.
    max_budget_eur   integer CHECK (max_budget_eur BETWEEN 0 AND 1000),
    session_rate_eur integer CHECK (session_rate_eur BETWEEN 0 AND 1000),
    visible          boolean NOT NULL DEFAULT true,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Le fil d'un utilisateur ne lit que les profils visibles du camp oppose.
CREATE INDEX idx_match_profiles_feed ON match_profiles (side, updated_at DESC) WHERE visible;

CREATE TRIGGER trg_match_profiles_updated_at
    BEFORE UPDATE ON match_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Decisions de swipe : une par paire orientee, la derniere l'emporte.
-- -----------------------------------------------------------------------------
CREATE TABLE match_swipes (
    swiper_id  uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    target_id  uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    decision   text NOT NULL CHECK (decision IN ('LIKE', 'SUPER_LIKE', 'PASS')),
    created_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (swiper_id, target_id),
    CONSTRAINT chk_match_swipes_distinct CHECK (swiper_id <> target_id)
);

-- Retrouver qui a aime (ou ecarte) un utilisateur.
CREATE INDEX idx_match_swipes_target ON match_swipes (target_id);


-- -----------------------------------------------------------------------------
-- Matchs : une ligne par paire (coach, athlete), unique en base. Defaire un
-- match le termine (ENDED) sans l'effacer : la conversation reste lisible,
-- l'envoi de messages est refuse.
-- -----------------------------------------------------------------------------
CREATE TABLE matches (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    athlete_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status     text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ENDED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    ended_at   timestamptz,

    CONSTRAINT chk_matches_distinct CHECK (coach_id <> athlete_id),
    CONSTRAINT uq_matches_pair UNIQUE (coach_id, athlete_id),
    CONSTRAINT chk_matches_ended CHECK ((status = 'ENDED') = (ended_at IS NOT NULL))
);

CREATE INDEX idx_matches_athlete ON matches (athlete_id);

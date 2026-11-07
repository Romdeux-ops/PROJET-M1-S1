-- =============================================================================
-- V9 : reservation de creneaux avec un coach (phase 9)
--
-- Le coach publie des creneaux fixes, un athlete reserve un creneau entier.
-- Les doubles reservations sont interdites par la base elle-meme (index unique
-- partiel et contraintes d'exclusion) : une verification applicative seule ne
-- resiste pas a deux requetes concurrentes.
-- =============================================================================

-- Egalite sur uuid dans un index gist, combinee au chevauchement de plages.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE availability_slots (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    starts_at  timestamptz NOT NULL,
    ends_at    timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_availability_slots_duration
        CHECK (ends_at > starts_at AND ends_at - starts_at <= interval '4 hours'),
    -- Un coach ne publie pas deux creneaux qui se chevauchent.
    CONSTRAINT excl_availability_slots_coach_overlap
        EXCLUDE USING gist (coach_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
);

CREATE INDEX idx_availability_slots_starts_at ON availability_slots (starts_at);

CREATE TRIGGER trg_availability_slots_updated_at
    BEFORE UPDATE ON availability_slots
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Reservations.
--
-- coach_id, starts_at et ends_at recopient le creneau (immuable une fois
-- publie) pour que la contrainte d'exclusion par athlete porte sur une seule
-- table. Une reservation annulee reste en historique et libere le creneau.
--
-- ON DELETE RESTRICT : supprimer un creneau qui porte une reservation
-- confirmee echoue meme si elle a ete creee entre la verification applicative
-- et la suppression.
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id      uuid NOT NULL REFERENCES availability_slots (id) ON DELETE RESTRICT,
    coach_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    athlete_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    starts_at    timestamptz NOT NULL,
    ends_at      timestamptz NOT NULL,
    status       text NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    note         text CHECK (note IS NULL OR char_length(note) <= 500),
    cancelled_at timestamptz,
    cancelled_by uuid REFERENCES users (id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_bookings_distinct CHECK (coach_id <> athlete_id),
    CONSTRAINT chk_bookings_cancellation
        CHECK ((status = 'CANCELLED') = (cancelled_at IS NOT NULL)),
    -- Un athlete n'a pas deux reservations confirmees qui se chevauchent,
    -- meme aupres de deux coachs differents.
    CONSTRAINT excl_bookings_athlete_overlap
        EXCLUDE USING gist (athlete_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
        WHERE (status = 'CONFIRMED')
);

-- Un creneau ne porte qu'une reservation confirmee a la fois.
CREATE UNIQUE INDEX uq_bookings_slot_confirmed ON bookings (slot_id) WHERE status = 'CONFIRMED';

CREATE INDEX idx_bookings_athlete_starts_at ON bookings (athlete_id, starts_at);
CREATE INDEX idx_bookings_coach_starts_at ON bookings (coach_id, starts_at);

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

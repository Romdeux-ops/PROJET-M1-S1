-- =============================================================================
-- V16 : profil public d'un coach (QR code) et demandes de suivi des athletes
--
-- Le coach choisit de rendre un profil public (desactive par defaut) : une page
-- accessible sans compte, dont le lien est partage par QR code. Un athlete
-- connecte peut y demander a etre suivi : la relation nait REQUESTED et le coach
-- l'accepte (ACTIVE) ou la refuse (DECLINED). Seul ACTIVE ouvre des droits.
-- =============================================================================

ALTER TABLE coach_athlete DROP CONSTRAINT coach_athlete_status_check;
ALTER TABLE coach_athlete
    ADD CONSTRAINT coach_athlete_status_check
        CHECK (status IN ('PENDING', 'REQUESTED', 'ACTIVE', 'DECLINED', 'ENDED'));

-- Statut a restaurer si l'athlete retire sa demande : une relation deja connue (DECLINED, ENDED)
-- ne doit pas disparaitre. NULL = la ligne est nee de la demande, on peut la supprimer.
ALTER TABLE coach_athlete
    ADD COLUMN status_before_request text
        CHECK (status_before_request IN ('DECLINED', 'ENDED'));

CREATE TABLE coach_public_profiles (
    coach_id   uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    enabled    boolean NOT NULL DEFAULT false,
    headline   text CHECK (headline IS NULL OR char_length(headline) <= 120),
    bio        text CHECK (bio IS NULL OR char_length(bio) <= 1000),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_coach_public_profiles_updated_at
    BEFORE UPDATE ON coach_public_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Nouveaux types de notification : demande recue, acceptee, refusee.
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
        CHECK (type IN (
            'SESSION_REMINDER', 'SESSION_PENDING_VALIDATION', 'SESSION_VALIDATED',
            'BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_REMINDER',
            'FOLLOW_REQUESTED', 'FOLLOW_ACCEPTED', 'FOLLOW_DECLINED'));

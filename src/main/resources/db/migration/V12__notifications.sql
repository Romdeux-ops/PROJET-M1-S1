-- =============================================================================
-- V12 : centre de notifications (rappels de seance, planning et reservations)
--
-- Notifications in-app, privees a leur destinataire. dedupe_key rend la creation
-- idempotente : un meme rappel (ex. 'reminder:<seance>:<date>') n'est jamais
-- cree deux fois pour un utilisateur, y compris si deux executions du job de
-- rappel se chevauchent. Les cles NULL ne se dedupliquent pas (notifications
-- ponctuelles sans cle).
-- =============================================================================

CREATE TABLE notifications (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type       text NOT NULL
               CHECK (type IN (
                   'SESSION_REMINDER', 'SESSION_PENDING_VALIDATION', 'SESSION_VALIDATED',
                   'BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_REMINDER')),
    title      text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
    link       text,
    dedupe_key text,
    read_at    timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_notifications_dedupe UNIQUE (user_id, dedupe_key),
    CONSTRAINT chk_notifications_read_after_created CHECK (read_at IS NULL OR read_at >= created_at)
);

-- Liste paginee, plus recentes d'abord.
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC, id DESC);

-- Compteur de non-lus : seule une petite fraction des lignes est concernee.
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE read_at IS NULL;

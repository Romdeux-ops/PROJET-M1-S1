-- =============================================================================
-- V10 : messagerie coach / athlete (phase 10)
--
-- Une conversation par paire (coach, athlete), creee a la demande. La paire
-- est unique en base : deux ouvertures concurrentes ne peuvent pas creer deux
-- conversations. Les messages sont immuables ; une conversation etant 1-1,
-- chaque message n'a qu'un destinataire et son accuse de lecture tient dans
-- read_at.
-- =============================================================================

CREATE TABLE conversations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id        uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    athlete_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    last_message_at timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_conversations_distinct CHECK (coach_id <> athlete_id),
    CONSTRAINT uq_conversations_pair UNIQUE (coach_id, athlete_id)
);

-- La contrainte unique couvre deja les recherches par coach_id.
CREATE INDEX idx_conversations_athlete ON conversations (athlete_id);

CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Messages.
--
-- L'historique se pagine par curseur (keyset) sur (created_at, id), du plus
-- recent au plus ancien : contrairement a un OFFSET, une page reste stable
-- quand de nouveaux messages arrivent pendant la lecture.
-- -----------------------------------------------------------------------------
CREATE TABLE messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_id       uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body            text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    created_at      timestamptz NOT NULL DEFAULT now(),
    read_at         timestamptz,

    CONSTRAINT chk_messages_read_after_sent CHECK (read_at IS NULL OR read_at >= created_at)
);

CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at DESC, id DESC);

-- Comptage des non-lus : seule une petite fraction des messages est concernee.
CREATE INDEX idx_messages_unread ON messages (conversation_id) WHERE read_at IS NULL;

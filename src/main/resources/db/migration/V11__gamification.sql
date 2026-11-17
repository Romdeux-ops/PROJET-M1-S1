-- =============================================================================
-- V11 : gamification (phase 11)
--
-- Le catalogue des badges est seme ici ; un badge gagne est fige dans
-- user_badges avec sa date d'obtention. Les points d'experience ne sont pas
-- stockes : ils se derivent des faits existants (seances, series, records,
-- seances planifiees validees), ce qui exclut toute derive entre le total
-- affiche et son historique. Les defis sont reserves a une itration future.
-- =============================================================================

CREATE TABLE badges (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text NOT NULL UNIQUE,
    name        text NOT NULL,
    description text NOT NULL,
    -- Seuil de la metrique visee (nombre de seances, jours de streak...),
    -- interprete par le code selon le badge.
    threshold   int  NOT NULL CHECK (threshold >= 1),
    position    int  NOT NULL UNIQUE,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_badges (
    user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    badge_id   uuid NOT NULL REFERENCES badges (id) ON DELETE CASCADE,
    awarded_at timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, badge_id)
);

INSERT INTO badges (code, name, description, threshold, position) VALUES
    ('FIRST_SESSION', 'Premiere seance',    'Enregistrer sa premiere seance d''entrainement.',          1, 1),
    ('SESSIONS_10',   'Habitue',            'Enregistrer 10 seances d''entrainement.',                 10, 2),
    ('SESSIONS_50',   'Machine',            'Enregistrer 50 seances d''entrainement.',                 50, 3),
    ('FIRST_PROGRAM', 'Architecte',         'Creer son premier programme.',                             1, 4),
    ('STREAK_7',      'Semaine parfaite',   'S''entrainer 7 jours d''affilee.',                         7, 5),
    ('STREAK_30',     'Mois de fer',        'S''entrainer 30 jours d''affilee.',                       30, 6),
    ('FIRST_PR',      'Premier record',     'Etablir son premier record personnel.',                    1, 7),
    ('PRS_10',        'Collectionneur',     'Detenir 10 records personnels.',                          10, 8);

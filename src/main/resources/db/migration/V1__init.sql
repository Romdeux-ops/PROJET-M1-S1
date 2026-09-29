-- =============================================================================
-- V1 : socle identite
--
-- Cette migration ne contient que ce qui est partage par tous les modules :
-- extensions, utilitaires communs, comptes, roles et preferences.
-- Chaque phase suivante apporte sa propre migration (V2 auth, V3 catalogue,
-- V4 programmes, ...) afin d'eviter les conflits sur un fichier unique.
--
-- Conventions du projet :
--   - cles primaires en uuid generes par la base
--   - toutes les dates/heures en timestamptz, jamais en timestamp
--   - enumerations portees par des CHECK et non par des types ENUM PostgreSQL,
--     car ajouter une valeur a un ENUM est bien plus penible en migration
--   - mesures stockees exclusivement en unites metriques (kg, cm)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;


-- Rattachee par trigger a chaque table portant une colonne updated_at.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
    code  text PRIMARY KEY,
    label text NOT NULL
);

INSERT INTO roles (code, label) VALUES
    ('ATHLETE', 'Sportif'),
    ('COACH',   'Coach'),
    ('ADMIN',   'Administrateur');


-- -----------------------------------------------------------------------------
-- Comptes utilisateurs
--
-- unit_system est une preference d'affichage uniquement : les charges et les
-- mensurations sont toujours persistees en kilogrammes et en centimetres.
-- Melanger les unites en base fausserait tout calcul de volume et toute
-- comparaison de record personnel.
--
-- locale suit la meme logique : l'API renvoie des codes stables
-- (WEIGHT_LOSS, BEGINNER, ...) et la traduction reste a la charge du client.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    email                 citext NOT NULL UNIQUE,
    password_hash         text   NOT NULL,

    display_name          text NOT NULL,
    avatar_url            text,
    bio                   text,
    birth_date            date,
    height_cm             numeric(5,1) CHECK (height_cm > 0 AND height_cm < 300),

    fitness_goal          text NOT NULL DEFAULT 'GENERAL_FITNESS'
                          CHECK (fitness_goal IN ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'GENERAL_FITNESS')),
    experience_level      text NOT NULL DEFAULT 'BEGINNER'
                          CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),

    unit_system           text    NOT NULL DEFAULT 'METRIC' CHECK (unit_system IN ('METRIC', 'IMPERIAL')),
    locale                text    NOT NULL DEFAULT 'fr'     CHECK (locale IN ('fr', 'en')),
    notifications_enabled boolean NOT NULL DEFAULT true,

    -- Pilote par le role ADMIN pour desactiver un compte sans le supprimer.
    status                text NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),

    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now()
);

-- L'unicite sur email cree deja son index, inutile d'en ajouter un second.
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_experience_level ON users (experience_level);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE user_roles (
    user_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_code text NOT NULL REFERENCES roles (code),
    PRIMARY KEY (user_id, role_code)
);

CREATE INDEX idx_user_roles_role_code ON user_roles (role_code);


-- -----------------------------------------------------------------------------
-- Historique du poids corporel
--
-- La fonctionnalite demandee est une courbe d'evolution, donc une serie
-- temporelle et non un champ scalaire. Le poids courant se lit comme la
-- derniere entree, il n'est volontairement pas duplique dans users.
-- -----------------------------------------------------------------------------
CREATE TABLE body_weight_entries (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    weight_kg   numeric(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
    measured_on date NOT NULL DEFAULT CURRENT_DATE,
    note        text,
    created_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_body_weight_per_day UNIQUE (user_id, measured_on)
);

CREATE INDEX idx_body_weight_user_date ON body_weight_entries (user_id, measured_on DESC);

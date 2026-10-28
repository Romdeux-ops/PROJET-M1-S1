-- =============================================================================
-- V2 : authentification
--
-- Remplace display_name par first_name / last_name : le formulaire
-- d'inscription du frontend saisit les deux separement, et le decoupage sert
-- egalement a l'affichage (initiales d'avatar, tri par nom).
-- =============================================================================

ALTER TABLE users ADD COLUMN first_name text;
ALTER TABLE users ADD COLUMN last_name text;

UPDATE users SET
    first_name = split_part(display_name, ' ', 1),
    last_name  = NULLIF(substr(display_name, length(split_part(display_name, ' ', 1)) + 2), '');

ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;

ALTER TABLE users DROP COLUMN display_name;

-- Phase 6 (suite) : validation d'une seance terminee par le coach actif de
-- l'athlete, ou auto-validation si l'athlete n'a pas de coach.

ALTER TABLE scheduled_sessions
    DROP CONSTRAINT scheduled_sessions_status_check;

ALTER TABLE scheduled_sessions
    ADD CONSTRAINT scheduled_sessions_status_check
    CHECK (status IN ('PLANNED', 'PENDING_VALIDATION', 'DONE', 'SKIPPED'));

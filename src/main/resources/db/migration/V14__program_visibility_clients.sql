-- Programmes visibles par les athletes actifs du coach proprietaire.

ALTER TABLE programs DROP CONSTRAINT programs_visibility_check;
ALTER TABLE programs
    ADD CONSTRAINT programs_visibility_check CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'CLIENTS'));

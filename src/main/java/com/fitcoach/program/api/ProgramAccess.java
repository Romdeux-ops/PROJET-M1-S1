package com.fitcoach.program.api;

import java.util.UUID;

/**
 * Point d'entree des autres modules (planning, carnet) qui rattachent une seance a un programme :
 * on ne peut utiliser qu'un programme que l'on peut voir.
 */
public interface ProgramAccess {

    /**
     * Verifie que {@code userId} peut utiliser ce programme et ce jour. Les deux identifiants
     * peuvent etre nuls ensemble (seance libre).
     *
     * @throws UnusableProgramException (404) programme inconnu ou invisible, sans distinction
     * @throws ProgramDayMismatchException (400) jour inconnu, d'un autre programme, ou sans programme
     */
    void assertCanUse(UUID userId, UUID programId, UUID programDayId);
}

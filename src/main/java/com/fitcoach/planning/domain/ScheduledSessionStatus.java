package com.fitcoach.planning.domain;

/**
 * Cycle de vie d'une seance planifiee :
 * PLANNED vers DONE (sans coach), PENDING_VALIDATION (avec coach) ou SKIPPED ;
 * PENDING_VALIDATION vers DONE par le coach ; SKIPPED vers PLANNED en la replanifiant.
 * DONE est terminal.
 */
public enum ScheduledSessionStatus {
    PLANNED,
    PENDING_VALIDATION,
    DONE,
    SKIPPED;

    public boolean canTransitionTo(ScheduledSessionStatus target) {
        return switch (this) {
            case PLANNED -> target == PENDING_VALIDATION || target == DONE || target == SKIPPED;
            case PENDING_VALIDATION -> target == DONE;
            case SKIPPED -> target == PLANNED;
            case DONE -> false;
        };
    }
}

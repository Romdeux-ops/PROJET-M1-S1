package com.fitcoach.program.domain;

public enum ProgramVisibility {
    PUBLIC,
    PRIVATE,
    /** Visible par les athletes ayant une relation ACTIVE avec le coach proprietaire. */
    CLIENTS,
}

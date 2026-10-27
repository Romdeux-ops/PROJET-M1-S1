package com.fitcoach.common.domain;

import java.util.UUID;

/** Element d'une liste ordonnee par une colonne {@code position} contigue a partir de 0. */
public interface Positioned {
    UUID getId();

    void setPosition(int position);
}

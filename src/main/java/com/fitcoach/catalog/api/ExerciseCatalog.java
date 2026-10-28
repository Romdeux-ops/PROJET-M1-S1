package com.fitcoach.catalog.api;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/** Point d'entree des autres modules vers le catalogue d'exercices. */
public interface ExerciseCatalog {

    boolean exists(UUID exerciseId);

    /** Les identifiants inconnus sont simplement absents de la map. */
    Map<UUID, String> namesOf(Collection<UUID> exerciseIds);
}

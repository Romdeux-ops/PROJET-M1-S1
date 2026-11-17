package com.fitcoach.catalog.api;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Point d'entree des autres modules vers le catalogue d'exercices. */
public interface ExerciseCatalog {

    boolean exists(UUID exerciseId);

    /** Les identifiants inconnus sont simplement absents de la map. */
    Map<UUID, String> namesOf(Collection<UUID> exerciseIds);

    /** Tout le catalogue, avec muscles primaires et tags, pour composer un programme. */
    List<CatalogExercise> listAll();
}

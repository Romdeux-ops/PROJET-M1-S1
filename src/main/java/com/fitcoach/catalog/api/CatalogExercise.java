package com.fitcoach.catalog.api;

import java.util.List;
import java.util.UUID;

/**
 * Vue allegee d'un exercice pour les modules qui composent des programmes.
 * Les libelles ({@code primaryMuscles}, {@code tags}) servent a l'affichage et
 * aux prompts ; les codes stables ({@code primaryMuscleCodes}, {@code tagCodes},
 * ex. {@code QUADS}, {@code COMPOUND}) servent aux regles de selection.
 */
public record CatalogExercise(
        UUID id,
        String name,
        String difficulty,
        List<String> primaryMuscles,
        List<String> tags,
        String description,
        String equipment,
        List<String> primaryMuscleCodes,
        List<String> tagCodes) {

    /** Forme reduite, sans codes ni materiel. */
    public CatalogExercise(
            UUID id, String name, String difficulty, List<String> primaryMuscles, List<String> tags) {
        this(id, name, difficulty, primaryMuscles, tags, null, null, List.of(), List.of());
    }
}

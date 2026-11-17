package com.fitcoach.catalog.api;

import java.util.List;
import java.util.UUID;

/** Vue allegee d'un exercice pour les modules qui composent des programmes. */
public record CatalogExercise(
        UUID id, String name, String difficulty, List<String> primaryMuscles, List<String> tags) {}

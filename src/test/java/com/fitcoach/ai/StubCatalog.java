package com.fitcoach.ai;

import com.fitcoach.catalog.api.CatalogExercise;
import com.fitcoach.catalog.api.ExerciseCatalog;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/** Catalogue en memoire pour les tests unitaires du generateur. */
final class StubCatalog implements ExerciseCatalog {

    private final List<CatalogExercise> exercises;

    StubCatalog(List<CatalogExercise> exercises) {
        this.exercises = exercises;
    }

    static CatalogExercise exercise(
            String name, String difficulty, String equipment, List<String> muscles, List<String> tags) {
        return new CatalogExercise(
                UUID.nameUUIDFromBytes(name.getBytes()), name, difficulty, muscles, tags, null, equipment, muscles, tags);
    }

    @Override
    public boolean exists(UUID exerciseId) {
        return exercises.stream().anyMatch(e -> e.id().equals(exerciseId));
    }

    @Override
    public Map<UUID, String> namesOf(Collection<UUID> exerciseIds) {
        return exercises.stream()
                .filter(e -> exerciseIds.contains(e.id()))
                .collect(Collectors.toMap(CatalogExercise::id, CatalogExercise::name));
    }

    @Override
    public List<CatalogExercise> listAll() {
        return exercises;
    }
}

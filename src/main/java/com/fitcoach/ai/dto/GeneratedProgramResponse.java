package com.fitcoach.ai.dto;

import java.util.List;
import java.util.UUID;

/**
 * Brouillon valide : rien n'est enregistre tant que l'utilisateur ne le confirme
 * pas. Les bornes de {@code sets}, {@code reps} et {@code restSeconds} suivent
 * celles de l'API des programmes, pour que l'enregistrement ne puisse pas echouer.
 */
public record GeneratedProgramResponse(
        String name,
        String description,
        GenerationCategory category,
        GenerationLevel level,
        GenerationSource source,
        List<Day> days) {

    public record Day(String label, List<Item> exercises) {}

    public record Item(UUID exerciseId, String exerciseName, int sets, String reps, int restSeconds) {}
}

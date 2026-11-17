package com.fitcoach.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Demande de generation. Les deux champs texte libres sont les seuls a venir
 * de l'utilisateur ; ils sont bornes et places dans une section delimitee du prompt.
 */
public record ProgramGenerationRequest(
        @NotNull GenerationGoal goal,
        @NotNull GenerationLevel level,
        @Min(1) @Max(7) int sessionsPerWeek,
        @Size(max = 300) String equipment,
        @Size(max = 500) String constraints) {}

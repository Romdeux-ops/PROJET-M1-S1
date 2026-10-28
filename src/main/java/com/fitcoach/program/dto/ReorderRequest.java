package com.fitcoach.program.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/** Nouvel ordre complet de la liste : chaque element existant, une seule fois. */
public record ReorderRequest(@NotEmpty List<@NotNull UUID> orderedIds) {}

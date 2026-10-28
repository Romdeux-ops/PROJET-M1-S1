package com.fitcoach.planning.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CompleteRequest(@NotNull UUID workoutSessionId) {}

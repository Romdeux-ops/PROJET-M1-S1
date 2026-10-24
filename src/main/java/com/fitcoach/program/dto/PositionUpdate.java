package com.fitcoach.program.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PositionUpdate(@NotNull UUID id, @Min(0) int position) {}

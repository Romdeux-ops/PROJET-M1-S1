package com.fitcoach.training.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record SessionRequest(
        @NotBlank @Size(max = 150) String title,
        @NotNull Instant performedAt,
        @Min(0) @Max(600) Integer durationMinutes,
        @Size(max = 2000) String notes,
        UUID programId,
        UUID programDayId) {}

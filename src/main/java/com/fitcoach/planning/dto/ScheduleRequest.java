package com.fitcoach.planning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record ScheduleRequest(
        @NotBlank @Size(max = 150) String title,
        @NotNull LocalDate scheduledDate,
        UUID programId,
        UUID programDayId,
        @Size(max = 1000) String notes) {}

package com.fitcoach.planning.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RescheduleRequest(@NotNull LocalDate scheduledDate) {}

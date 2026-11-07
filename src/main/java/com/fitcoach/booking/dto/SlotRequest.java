package com.fitcoach.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record SlotRequest(@NotNull Instant startsAt, @NotNull Instant endsAt) {}

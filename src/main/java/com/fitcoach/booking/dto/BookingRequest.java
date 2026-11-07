package com.fitcoach.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record BookingRequest(@NotNull UUID slotId, @Size(max = 500) String note) {}

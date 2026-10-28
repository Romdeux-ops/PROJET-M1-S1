package com.fitcoach.program.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProgramDayRequest(@NotBlank @Size(min = 1, max = 100) String name, boolean restDay) {}

package com.fitcoach.program.dto;

import com.fitcoach.program.domain.ProgramCategory;
import com.fitcoach.program.domain.ProgramLevel;
import com.fitcoach.program.domain.ProgramVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProgramRequest(
        @NotBlank @Size(min = 2, max = 150) String title,
        @Size(max = 5000) String description,
        @NotNull ProgramCategory category,
        @NotNull ProgramLevel level,
        @NotNull ProgramVisibility visibility) {}

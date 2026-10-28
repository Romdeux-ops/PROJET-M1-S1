package com.fitcoach.program.dto;

import com.fitcoach.program.domain.Program;
import com.fitcoach.program.domain.ProgramCategory;
import com.fitcoach.program.domain.ProgramLevel;
import com.fitcoach.program.domain.ProgramVisibility;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProgramResponse(
        UUID id,
        UUID ownerId,
        String ownerName,
        String title,
        String description,
        ProgramCategory category,
        ProgramLevel level,
        ProgramVisibility visibility,
        String shareToken,
        double averageRating,
        int ratingsCount,
        boolean mine,
        List<ProgramDayResponse> days,
        Instant createdAt,
        Instant updatedAt) {

    public static ProgramResponse from(
            Program program,
            String ownerName,
            double averageRating,
            int ratingsCount,
            boolean mine,
            List<ProgramDayResponse> days) {
        return new ProgramResponse(
                program.getId(),
                program.getOwnerId(),
                ownerName,
                program.getTitle(),
                program.getDescription(),
                program.getCategory(),
                program.getLevel(),
                program.getVisibility(),
                mine ? program.getShareToken() : null,
                averageRating,
                ratingsCount,
                mine,
                days,
                program.getCreatedAt(),
                program.getUpdatedAt());
    }
}

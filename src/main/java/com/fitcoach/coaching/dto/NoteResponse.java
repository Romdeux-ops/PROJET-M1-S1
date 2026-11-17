package com.fitcoach.coaching.dto;

import com.fitcoach.coaching.domain.CoachNote;
import java.time.Instant;
import java.util.UUID;

public record NoteResponse(UUID id, UUID athleteId, String content, Instant createdAt, Instant updatedAt) {

    public static NoteResponse from(CoachNote note) {
        return new NoteResponse(
                note.getId(), note.getAthleteId(), note.getContent(), note.getCreatedAt(), note.getUpdatedAt());
    }
}

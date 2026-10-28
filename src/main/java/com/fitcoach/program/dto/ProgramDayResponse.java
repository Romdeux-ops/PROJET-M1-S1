package com.fitcoach.program.dto;

import com.fitcoach.program.domain.ProgramDay;
import java.util.List;
import java.util.UUID;

public record ProgramDayResponse(
        UUID id, int position, String name, boolean restDay, List<ProgramExerciseResponse> exercises) {

    public static ProgramDayResponse from(ProgramDay day, List<ProgramExerciseResponse> exercises) {
        return new ProgramDayResponse(day.getId(), day.getPosition(), day.getName(), day.isRestDay(), exercises);
    }
}

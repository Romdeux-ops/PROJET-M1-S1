package com.fitcoach.program.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.common.web.PageResponse;
import com.fitcoach.program.domain.ProgramCategory;
import com.fitcoach.program.domain.ProgramLevel;
import com.fitcoach.program.dto.PositionUpdate;
import com.fitcoach.program.dto.ProgramDayRequest;
import com.fitcoach.program.dto.ProgramExerciseRequest;
import com.fitcoach.program.dto.ProgramRequest;
import com.fitcoach.program.dto.ProgramResponse;
import com.fitcoach.program.dto.RatingRequest;
import com.fitcoach.program.service.ProgramService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @GetMapping
    public PageResponse<ProgramResponse> search(
            Authentication authentication,
            @RequestParam(defaultValue = "false") boolean mineOnly,
            @RequestParam(required = false) ProgramCategory category,
            @RequestParam(required = false) ProgramLevel level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageRequest =
                PageRequest.of(Math.max(page, 0), boundedSize, Sort.by(Sort.Direction.DESC, "updatedAt"));
        return PageResponse.of(programService.search(
                AuthenticatedUsers.id(authentication), mineOnly, category, level, pageRequest));
    }

    @GetMapping("/shared/{shareToken}")
    public ProgramResponse getShared(Authentication authentication, @PathVariable String shareToken) {
        return programService.getByShareToken(shareToken, AuthenticatedUsers.idOrNull(authentication));
    }

    @GetMapping("/{programId}")
    public ProgramResponse get(Authentication authentication, @PathVariable UUID programId) {
        return programService.get(programId, AuthenticatedUsers.id(authentication));
    }

    @PostMapping
    public ResponseEntity<ProgramResponse> create(Authentication authentication, @Valid @RequestBody ProgramRequest request) {
        ProgramResponse program = programService.create(AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(program);
    }

    @PutMapping("/{programId}")
    public ProgramResponse update(
            Authentication authentication, @PathVariable UUID programId, @Valid @RequestBody ProgramRequest request) {
        return programService.update(programId, AuthenticatedUsers.id(authentication), request);
    }

    @DeleteMapping("/{programId}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID programId) {
        programService.delete(programId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{programId}/duplicate")
    public ResponseEntity<ProgramResponse> duplicate(Authentication authentication, @PathVariable UUID programId) {
        ProgramResponse copy = programService.duplicate(programId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(copy);
    }

    @PostMapping("/{programId}/days")
    public ProgramResponse addDay(
            Authentication authentication, @PathVariable UUID programId, @Valid @RequestBody ProgramDayRequest request) {
        return programService.addDay(programId, AuthenticatedUsers.id(authentication), request);
    }

    @DeleteMapping("/{programId}/days/{dayId}")
    public ProgramResponse deleteDay(
            Authentication authentication, @PathVariable UUID programId, @PathVariable UUID dayId) {
        return programService.deleteDay(programId, dayId, AuthenticatedUsers.id(authentication));
    }

    @PatchMapping("/{programId}/days/positions")
    public ProgramResponse reorderDays(
            Authentication authentication, @PathVariable UUID programId, @RequestBody List<PositionUpdate> updates) {
        return programService.reorderDays(programId, AuthenticatedUsers.id(authentication), updates);
    }

    @PostMapping("/{programId}/days/{dayId}/exercises")
    public ProgramResponse addExercise(
            Authentication authentication,
            @PathVariable UUID programId,
            @PathVariable UUID dayId,
            @Valid @RequestBody ProgramExerciseRequest request) {
        return programService.addExercise(programId, dayId, AuthenticatedUsers.id(authentication), request);
    }

    @DeleteMapping("/{programId}/days/{dayId}/exercises/{exerciseEntryId}")
    public ProgramResponse deleteExercise(
            Authentication authentication,
            @PathVariable UUID programId,
            @PathVariable UUID dayId,
            @PathVariable UUID exerciseEntryId) {
        return programService.deleteExercise(programId, dayId, exerciseEntryId, AuthenticatedUsers.id(authentication));
    }

    @PatchMapping("/{programId}/days/{dayId}/exercises/positions")
    public ProgramResponse reorderExercises(
            Authentication authentication,
            @PathVariable UUID programId,
            @PathVariable UUID dayId,
            @RequestBody List<PositionUpdate> updates) {
        return programService.reorderExercises(programId, dayId, AuthenticatedUsers.id(authentication), updates);
    }

    @PostMapping("/{programId}/ratings")
    public ProgramResponse rate(
            Authentication authentication, @PathVariable UUID programId, @Valid @RequestBody RatingRequest request) {
        return programService.rate(programId, AuthenticatedUsers.id(authentication), request);
    }
}

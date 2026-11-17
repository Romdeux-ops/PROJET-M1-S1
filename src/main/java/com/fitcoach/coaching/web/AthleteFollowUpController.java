package com.fitcoach.coaching.web;

import com.fitcoach.coaching.dto.AthleteOverviewResponse;
import com.fitcoach.coaching.dto.NoteRequest;
import com.fitcoach.coaching.dto.NoteResponse;
import com.fitcoach.coaching.service.AthleteOverviewService;
import com.fitcoach.coaching.service.CoachNoteService;
import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.common.web.PageResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Suivi d'un athlete par son coach : tableau de bord et notes privees. */
@RestController
@RequestMapping("/api/coaching/athletes/{athleteId}")
@PreAuthorize("hasAuthority('COACH')")
public class AthleteFollowUpController {

    private final AthleteOverviewService overviewService;
    private final CoachNoteService noteService;

    public AthleteFollowUpController(AthleteOverviewService overviewService, CoachNoteService noteService) {
        this.overviewService = overviewService;
        this.noteService = noteService;
    }

    @GetMapping("/overview")
    public AthleteOverviewResponse overview(Authentication authentication, @PathVariable UUID athleteId) {
        return overviewService.overview(AuthenticatedUsers.id(authentication), athleteId);
    }

    @GetMapping("/notes")
    public PageResponse<NoteResponse> listNotes(
            Authentication authentication,
            @PathVariable UUID athleteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        return PageResponse.of(noteService.list(
                AuthenticatedUsers.id(authentication), athleteId, PageRequest.of(Math.max(page, 0), boundedSize)));
    }

    @PostMapping("/notes")
    public ResponseEntity<NoteResponse> createNote(
            Authentication authentication, @PathVariable UUID athleteId, @Valid @RequestBody NoteRequest request) {
        NoteResponse note = noteService.create(AuthenticatedUsers.id(authentication), athleteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @PutMapping("/notes/{noteId}")
    public NoteResponse updateNote(
            Authentication authentication,
            @PathVariable UUID athleteId,
            @PathVariable UUID noteId,
            @Valid @RequestBody NoteRequest request) {
        return noteService.update(AuthenticatedUsers.id(authentication), athleteId, noteId, request);
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(
            Authentication authentication, @PathVariable UUID athleteId, @PathVariable UUID noteId) {
        noteService.delete(AuthenticatedUsers.id(authentication), athleteId, noteId);
        return ResponseEntity.noContent().build();
    }
}

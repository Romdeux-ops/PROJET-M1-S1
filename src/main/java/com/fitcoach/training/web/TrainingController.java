package com.fitcoach.training.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.training.dto.PersonalRecordResponse;
import com.fitcoach.training.dto.SessionRequest;
import com.fitcoach.training.dto.SessionResponse;
import com.fitcoach.training.dto.SessionSetRequest;
import com.fitcoach.training.service.TrainingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping("/sessions")
    public List<SessionResponse> listSessions(Authentication authentication) {
        return trainingService.listSessions(AuthenticatedUsers.id(authentication));
    }

    @GetMapping("/sessions/{sessionId}")
    public SessionResponse getSession(Authentication authentication, @PathVariable UUID sessionId) {
        return trainingService.getSession(sessionId, AuthenticatedUsers.id(authentication));
    }

    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> createSession(
            Authentication authentication, @Valid @RequestBody SessionRequest request) {
        SessionResponse session = trainingService.createSession(AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @PutMapping("/sessions/{sessionId}")
    public SessionResponse updateSession(
            Authentication authentication, @PathVariable UUID sessionId, @Valid @RequestBody SessionRequest request) {
        return trainingService.updateSession(sessionId, AuthenticatedUsers.id(authentication), request);
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(Authentication authentication, @PathVariable UUID sessionId) {
        trainingService.deleteSession(sessionId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/{sessionId}/sets")
    public SessionResponse addSet(
            Authentication authentication, @PathVariable UUID sessionId, @Valid @RequestBody SessionSetRequest request) {
        return trainingService.addSet(sessionId, AuthenticatedUsers.id(authentication), request);
    }

    @DeleteMapping("/sessions/{sessionId}/sets/{setId}")
    public SessionResponse deleteSet(
            Authentication authentication, @PathVariable UUID sessionId, @PathVariable UUID setId) {
        return trainingService.deleteSet(sessionId, setId, AuthenticatedUsers.id(authentication));
    }

    @GetMapping("/personal-records")
    public List<PersonalRecordResponse> listPersonalRecords(Authentication authentication) {
        return trainingService.listPersonalRecords(AuthenticatedUsers.id(authentication));
    }
}

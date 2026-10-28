package com.fitcoach.planning.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.planning.dto.CompleteRequest;
import com.fitcoach.planning.dto.RescheduleRequest;
import com.fitcoach.planning.dto.ScheduleRequest;
import com.fitcoach.planning.dto.ScheduledSessionResponse;
import com.fitcoach.planning.service.PlanningService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/planning")
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @GetMapping("/scheduled")
    public List<ScheduledSessionResponse> listBetween(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return planningService.listBetween(AuthenticatedUsers.id(authentication), from, to);
    }

    @GetMapping("/scheduled/today")
    public List<ScheduledSessionResponse> listToday(Authentication authentication) {
        return planningService.listToday(AuthenticatedUsers.id(authentication));
    }

    @GetMapping("/pending-validations")
    public List<ScheduledSessionResponse> listPendingValidations(Authentication authentication) {
        return planningService.listPendingValidations(AuthenticatedUsers.id(authentication));
    }

    @PostMapping("/scheduled")
    public ResponseEntity<ScheduledSessionResponse> schedule(
            Authentication authentication, @Valid @RequestBody ScheduleRequest request) {
        ScheduledSessionResponse response = planningService.schedule(AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/scheduled/{scheduledSessionId}/reschedule")
    public ScheduledSessionResponse reschedule(
            Authentication authentication,
            @PathVariable UUID scheduledSessionId,
            @Valid @RequestBody RescheduleRequest request) {
        return planningService.reschedule(scheduledSessionId, AuthenticatedUsers.id(authentication), request);
    }

    @PatchMapping("/scheduled/{scheduledSessionId}/skip")
    public ScheduledSessionResponse skip(Authentication authentication, @PathVariable UUID scheduledSessionId) {
        return planningService.skip(scheduledSessionId, AuthenticatedUsers.id(authentication));
    }

    @PatchMapping("/scheduled/{scheduledSessionId}/complete")
    public ScheduledSessionResponse complete(
            Authentication authentication,
            @PathVariable UUID scheduledSessionId,
            @Valid @RequestBody CompleteRequest request) {
        return planningService.complete(scheduledSessionId, AuthenticatedUsers.id(authentication), request);
    }

    @PatchMapping("/scheduled/{scheduledSessionId}/validate")
    public ScheduledSessionResponse validate(Authentication authentication, @PathVariable UUID scheduledSessionId) {
        return planningService.validate(scheduledSessionId, AuthenticatedUsers.id(authentication));
    }

    @DeleteMapping("/scheduled/{scheduledSessionId}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID scheduledSessionId) {
        planningService.delete(scheduledSessionId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }
}

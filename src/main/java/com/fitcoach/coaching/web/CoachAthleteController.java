package com.fitcoach.coaching.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.coaching.dto.AddAthleteRequest;
import com.fitcoach.coaching.service.CoachingService;
import com.fitcoach.identity.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coaching/athletes")
public class CoachAthleteController {

    private final CoachingService coachingService;

    public CoachAthleteController(CoachingService coachingService) {
        this.coachingService = coachingService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<UserResponse> add(Authentication authentication, @Valid @RequestBody AddAthleteRequest request) {
        UserResponse athlete = coachingService.addAthlete(AuthenticatedUsers.id(authentication), request.athleteEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(athlete);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COACH')")
    public List<UserResponse> list(Authentication authentication) {
        return coachingService.listAthletes(AuthenticatedUsers.id(authentication));
    }
}

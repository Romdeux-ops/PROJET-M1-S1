package com.fitcoach.coaching.web;

import com.fitcoach.coaching.dto.AddAthleteRequest;
import com.fitcoach.coaching.dto.InvitationResponse;
import com.fitcoach.coaching.service.CoachingService;
import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.identity.api.UserSummary;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    /** Envoie une invitation : l'athlete reste PENDING tant qu'il n'a pas accepte. */
    @PostMapping
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<InvitationResponse> invite(
            Authentication authentication, @Valid @RequestBody AddAthleteRequest request) {
        InvitationResponse invitation = coachingService.invite(AuthenticatedUsers.id(authentication), request.athleteEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(invitation);
    }

    /** Athletes dont la relation est active. */
    @GetMapping
    @PreAuthorize("hasAuthority('COACH')")
    public List<UserSummary> list(Authentication authentication) {
        return coachingService.listAthletes(AuthenticatedUsers.id(authentication));
    }

    /** Le coach met fin a la relation avec un athlete actif. */
    @DeleteMapping("/{athleteId}")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> end(Authentication authentication, @PathVariable UUID athleteId) {
        coachingService.endRelation(AuthenticatedUsers.id(authentication), athleteId);
        return ResponseEntity.noContent().build();
    }
}

package com.fitcoach.coaching.web;

import com.fitcoach.coaching.dto.InvitationResponse;
import com.fitcoach.coaching.service.CoachingService;
import com.fitcoach.common.security.AuthenticatedUsers;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cycle de vie des invitations : le coach envoie (voir {@link CoachAthleteController}) et annule, l'athlete repond. */
@RestController
@RequestMapping("/api/coaching/invitations")
public class InvitationController {

    private final CoachingService coachingService;

    public InvitationController(CoachingService coachingService) {
        this.coachingService = coachingService;
    }

    @GetMapping("/sent")
    @PreAuthorize("hasAuthority('COACH')")
    public List<InvitationResponse> listSent(Authentication authentication) {
        return coachingService.listSentInvitations(AuthenticatedUsers.id(authentication));
    }

    @DeleteMapping("/sent/{athleteId}")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable UUID athleteId) {
        coachingService.cancelInvitation(AuthenticatedUsers.id(authentication), athleteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/received")
    @PreAuthorize("hasAuthority('ATHLETE')")
    public List<InvitationResponse> listReceived(Authentication authentication) {
        return coachingService.listReceivedInvitations(AuthenticatedUsers.id(authentication));
    }

    @PostMapping("/received/{coachId}/accept")
    @PreAuthorize("hasAuthority('ATHLETE')")
    public ResponseEntity<Void> accept(Authentication authentication, @PathVariable UUID coachId) {
        coachingService.acceptInvitation(AuthenticatedUsers.id(authentication), coachId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/received/{coachId}/decline")
    @PreAuthorize("hasAuthority('ATHLETE')")
    public ResponseEntity<Void> decline(Authentication authentication, @PathVariable UUID coachId) {
        coachingService.declineInvitation(AuthenticatedUsers.id(authentication), coachId);
        return ResponseEntity.noContent().build();
    }
}

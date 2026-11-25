package com.fitcoach.coaching.web;

import com.fitcoach.coaching.dto.InvitationResponse;
import com.fitcoach.coaching.service.FollowRequestService;
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

/** Demandes de suivi : le coach repond a celles qu'il recoit, l'athlete retire celles qu'il a envoyees. */
@RestController
@RequestMapping("/api/coaching/follow-requests")
public class FollowRequestController {

    private final FollowRequestService followRequestService;

    public FollowRequestController(FollowRequestService followRequestService) {
        this.followRequestService = followRequestService;
    }

    @GetMapping("/received")
    @PreAuthorize("hasAuthority('COACH')")
    public List<InvitationResponse> listReceived(Authentication authentication) {
        return followRequestService.listReceived(AuthenticatedUsers.id(authentication));
    }

    @PostMapping("/received/{athleteId}/accept")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> accept(Authentication authentication, @PathVariable UUID athleteId) {
        followRequestService.accept(AuthenticatedUsers.id(authentication), athleteId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/received/{athleteId}/decline")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> decline(Authentication authentication, @PathVariable UUID athleteId) {
        followRequestService.decline(AuthenticatedUsers.id(authentication), athleteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sent")
    @PreAuthorize("hasAuthority('ATHLETE')")
    public List<InvitationResponse> listSent(Authentication authentication) {
        return followRequestService.listSent(AuthenticatedUsers.id(authentication));
    }

    @DeleteMapping("/sent/{coachId}")
    @PreAuthorize("hasAuthority('ATHLETE')")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable UUID coachId) {
        followRequestService.cancel(AuthenticatedUsers.id(authentication), coachId);
        return ResponseEntity.noContent().build();
    }
}

package com.fitcoach.coaching.web;

import com.fitcoach.coaching.dto.InvitationResponse;
import com.fitcoach.coaching.dto.PublicCoachProfileResponse;
import com.fitcoach.coaching.service.CoachProfileService;
import com.fitcoach.coaching.service.FollowRequestService;
import com.fitcoach.common.security.AuthenticatedUsers;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Page de profil d'un coach (cible du QR code) : lecture sans compte, demande de suivi reservee aux athletes. */
@RestController
@RequestMapping("/api/coaching/public/coaches")
public class PublicCoachController {

    private final CoachProfileService profileService;
    private final FollowRequestService followRequestService;

    public PublicCoachController(CoachProfileService profileService, FollowRequestService followRequestService) {
        this.profileService = profileService;
        this.followRequestService = followRequestService;
    }

    @GetMapping("/{coachId}")
    public PublicCoachProfileResponse get(Authentication authentication, @PathVariable UUID coachId) {
        return profileService.getPublicProfile(coachId, AuthenticatedUsers.idOrNull(authentication));
    }

    @PostMapping("/{coachId}/follow-requests")
    @PreAuthorize("hasAuthority('ATHLETE')")
    public ResponseEntity<InvitationResponse> requestFollow(Authentication authentication, @PathVariable UUID coachId) {
        InvitationResponse request = followRequestService.request(AuthenticatedUsers.id(authentication), coachId);
        return ResponseEntity.status(HttpStatus.CREATED).body(request);
    }
}

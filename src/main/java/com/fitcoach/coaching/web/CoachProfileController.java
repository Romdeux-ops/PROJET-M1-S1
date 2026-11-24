package com.fitcoach.coaching.web;

import com.fitcoach.coaching.dto.PublicProfileSettingsResponse;
import com.fitcoach.coaching.dto.UpdatePublicProfileRequest;
import com.fitcoach.coaching.service.CoachProfileService;
import com.fitcoach.common.security.AuthenticatedUsers;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Reglages du profil public, tels que le coach les gere depuis son espace. */
@RestController
@RequestMapping("/api/coaching/public-profile")
public class CoachProfileController {

    private final CoachProfileService profileService;

    public CoachProfileController(CoachProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('COACH')")
    public PublicProfileSettingsResponse get(Authentication authentication) {
        return profileService.getSettings(AuthenticatedUsers.id(authentication));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('COACH')")
    public PublicProfileSettingsResponse update(
            Authentication authentication, @Valid @RequestBody UpdatePublicProfileRequest request) {
        return profileService.updateSettings(AuthenticatedUsers.id(authentication), request);
    }
}

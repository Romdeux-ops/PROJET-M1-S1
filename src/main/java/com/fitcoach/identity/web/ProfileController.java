package com.fitcoach.identity.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.identity.dto.ProfileResponse;
import com.fitcoach.identity.dto.UpdateProfileRequest;
import com.fitcoach.identity.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Profil complet (au-dela de {@code SessionUser}) : bio, mensurations,
 * objectif, preferences et photo de profil.
 */
@RestController
@RequestMapping("/api/users/me/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileResponse get(Authentication authentication) {
        return profileService.getProfile(AuthenticatedUsers.id(authentication));
    }

    @PatchMapping
    public ProfileResponse update(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(AuthenticatedUsers.id(authentication), request);
    }

    @PostMapping(path = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AvatarResponse uploadAvatar(Authentication authentication, @RequestParam("file") MultipartFile file) {
        String avatarUrl = profileService.updateAvatar(AuthenticatedUsers.id(authentication), file);
        return new AvatarResponse(avatarUrl);
    }

    public record AvatarResponse(String avatarUrl) {}
}

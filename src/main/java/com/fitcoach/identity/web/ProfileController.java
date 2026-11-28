package com.fitcoach.identity.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.identity.dto.BodyWeightRequest;
import com.fitcoach.identity.dto.BodyWeightResponse;
import com.fitcoach.identity.dto.ProfileResponse;
import com.fitcoach.identity.dto.UpdateProfileRequest;
import com.fitcoach.identity.service.ProfileService;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Profil complet : bio, mensurations, objectif,
 * preferences, photo et historique du poids.
 */
@RestController
@RequestMapping("/api/users/me/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // ==========================================
    // Endpoints existants
    // ==========================================

    @GetMapping
    public ProfileResponse get(
            Authentication authentication
    ) {

        return profileService.getProfile(
                AuthenticatedUsers.id(authentication)
        );
    }

    @PatchMapping
    public ProfileResponse update(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {

        return profileService.updateProfile(
                AuthenticatedUsers.id(authentication),
                request
        );
    }

    @PostMapping(
            path = "/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public AvatarResponse uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {

        String avatarUrl = profileService.updateAvatar(
                AuthenticatedUsers.id(authentication),
                file
        );

        return new AvatarResponse(avatarUrl);
    }

    // ==========================================
    // Endpoints de gestion du poids
    // ==========================================

    @GetMapping("/weight")
    public List<BodyWeightResponse> getWeightHistory(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to

    ) {

        return profileService.getWeightHistory(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }

    @PutMapping("/weight/{date}")
    public BodyWeightResponse saveWeight(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @Valid @RequestBody BodyWeightRequest request

    ) {

        return profileService.saveWeight(
                AuthenticatedUsers.id(authentication),
                date,
                request
        );
    }

    @DeleteMapping("/weight/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWeight(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date

    ) {

        profileService.deleteWeight(
                AuthenticatedUsers.id(authentication),
                date
        );
    }

    public record AvatarResponse(String avatarUrl) {}
}
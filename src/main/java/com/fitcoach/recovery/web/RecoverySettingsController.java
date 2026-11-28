package com.fitcoach.recovery.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.recovery.dto.RecoverySettingsRequest;
import com.fitcoach.recovery.dto.RecoverySettingsResponse;
import com.fitcoach.recovery.service.RecoverySettingsService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recovery/settings")
public class RecoverySettingsController {

    private final RecoverySettingsService settingsService;

    public RecoverySettingsController(
            RecoverySettingsService settingsService
    ) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public RecoverySettingsResponse getSettings(
            Authentication authentication
    ) {

        return settingsService.getSettings(
                AuthenticatedUsers.id(authentication)
        );
    }

    @PutMapping
    public RecoverySettingsResponse updateSettings(

            Authentication authentication,

            @Valid @RequestBody
            RecoverySettingsRequest request

    ) {

        return settingsService.updateSettings(
                AuthenticatedUsers.id(authentication),
                request
        );
    }
}
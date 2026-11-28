package com.fitcoach.recovery.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.recovery.dto.RecoveryOverviewResponse;
import com.fitcoach.recovery.service.RecoveryOverviewService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recovery/overview")
public class RecoveryOverviewController {

    private final RecoveryOverviewService overviewService;

    public RecoveryOverviewController(
            RecoveryOverviewService overviewService
    ) {
        this.overviewService = overviewService;
    }

    @GetMapping
    public RecoveryOverviewResponse getOverview(
            Authentication authentication
    ) {

        return overviewService.getOverview(
                AuthenticatedUsers.id(authentication)
        );
    }

    @PostMapping("/refresh")
    public RecoveryOverviewResponse refreshOverview(
            Authentication authentication
    ) {

        return overviewService.refreshOverview(
                AuthenticatedUsers.id(authentication)
        );
    }
}
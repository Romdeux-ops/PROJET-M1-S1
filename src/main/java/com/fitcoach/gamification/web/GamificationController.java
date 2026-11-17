package com.fitcoach.gamification.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.gamification.dto.BadgeResponse;
import com.fitcoach.gamification.dto.GamificationProfileResponse;
import com.fitcoach.gamification.dto.LeaderboardEntryResponse;
import com.fitcoach.gamification.service.GamificationService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/me")
    public GamificationProfileResponse me(Authentication authentication) {
        return gamificationService.profile(AuthenticatedUsers.id(authentication));
    }

    @GetMapping("/badges")
    public List<BadgeResponse> badges() {
        return gamificationService.catalog();
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntryResponse> leaderboard(Authentication authentication) {
        return gamificationService.leaderboard(AuthenticatedUsers.id(authentication));
    }
}

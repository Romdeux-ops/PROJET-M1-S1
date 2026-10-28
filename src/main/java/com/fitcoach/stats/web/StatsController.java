package com.fitcoach.stats.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.stats.dto.ExerciseProgressionPoint;
import com.fitcoach.stats.dto.MuscleVolumeShare;
import com.fitcoach.stats.dto.ProgressionScoreResponse;
import com.fitcoach.stats.dto.StatsOverviewResponse;
import com.fitcoach.stats.dto.StreakResponse;
import com.fitcoach.stats.dto.WeeklyAdherencePoint;
import com.fitcoach.stats.dto.WeeklyVolumePoint;
import com.fitcoach.stats.service.StatsService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/overview")
    public StatsOverviewResponse overview(Authentication authentication) {
        return statsService.overview(AuthenticatedUsers.id(authentication));
    }

    @GetMapping("/exercises/{exerciseId}/progression")
    public List<ExerciseProgressionPoint> exerciseProgression(
            Authentication authentication, @PathVariable UUID exerciseId) {
        return statsService.exerciseProgression(AuthenticatedUsers.id(authentication), exerciseId);
    }

    @GetMapping("/volume/weekly")
    public List<WeeklyVolumePoint> weeklyVolume(
            Authentication authentication, @RequestParam(defaultValue = "12") int weeks) {
        return statsService.weeklyVolume(AuthenticatedUsers.id(authentication), weeks);
    }

    @GetMapping("/streak")
    public StreakResponse streak(Authentication authentication) {
        return statsService.streak(AuthenticatedUsers.id(authentication));
    }

    @GetMapping("/adherence/weekly")
    public List<WeeklyAdherencePoint> weeklyAdherence(
            Authentication authentication, @RequestParam(defaultValue = "8") int weeks) {
        return statsService.weeklyAdherence(AuthenticatedUsers.id(authentication), weeks);
    }

    @GetMapping("/muscle-distribution")
    public List<MuscleVolumeShare> muscleDistribution(
            Authentication authentication, @RequestParam(defaultValue = "30") int days) {
        return statsService.muscleDistribution(AuthenticatedUsers.id(authentication), days);
    }

    @GetMapping("/progression-score")
    public ProgressionScoreResponse progressionScore(Authentication authentication) {
        return statsService.progressionScore(AuthenticatedUsers.id(authentication));
    }
}

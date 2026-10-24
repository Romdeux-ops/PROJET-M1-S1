package com.fitcoach.stats.dto;

import java.util.List;

public record StatsOverviewResponse(
        int sessionsThisWeek,
        int sessionsTrend,
        int minutesThisWeek,
        int minutesTrend,
        int currentStreakDays,
        double averageEffort,
        List<WeeklyActivityPoint> weeklyActivity) {}

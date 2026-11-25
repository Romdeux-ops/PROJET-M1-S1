package com.fitcoach.stats.service;

import com.fitcoach.stats.api.AthleteActivity;
import com.fitcoach.stats.repository.StatsQueries;
import com.fitcoach.stats.repository.StatsQueries.DailyActivity;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
class JpaAthleteActivity implements AthleteActivity {

    private static final int RECENT_DAYS = 30;

    private final StatsQueries statsQueries;
    private final StatsService statsService;
    private final Clock clock;

    JpaAthleteActivity(StatsQueries statsQueries, StatsService statsService, Clock clock) {
        this.statsQueries = statsQueries;
        this.statsService = statsService;
        this.clock = clock;
    }

    @Override
    public Snapshot snapshot(UUID athleteId) {
        ZoneId zone = clock.getZone();
        LocalDate today = LocalDate.now(clock);
        int sessions = statsQueries.dailyActivity(athleteId, zone, today.minusDays(RECENT_DAYS - 1L), today).stream()
                .mapToInt(DailyActivity::sessions)
                .sum();
        List<LocalDate> latest = statsQueries.recentTrainingDays(athleteId, zone, today, 1);
        LocalDate lastSessionDate = latest.isEmpty() ? null : latest.get(0);
        return new Snapshot(sessions, lastSessionDate, statsService.streak(athleteId).currentStreakDays());
    }
}

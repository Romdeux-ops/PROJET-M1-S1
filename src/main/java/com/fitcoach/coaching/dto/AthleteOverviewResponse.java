package com.fitcoach.coaching.dto;

import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.planning.api.UpcomingSession;
import java.time.LocalDate;
import java.util.List;

/** Tableau de suivi d'un athlete pour son coach ({@code lastSessionDate} est null si aucune seance). */
public record AthleteOverviewResponse(
        UserSummary athlete,
        int sessionsLast30Days,
        LocalDate lastSessionDate,
        int currentStreakDays,
        int pendingValidations,
        List<UpcomingSession> upcomingSessions) {}

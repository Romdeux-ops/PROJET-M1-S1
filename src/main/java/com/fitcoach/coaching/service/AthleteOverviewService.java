package com.fitcoach.coaching.service;

import com.fitcoach.coaching.dto.AthleteOverviewResponse;
import com.fitcoach.coaching.exception.AthleteNotFoundException;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.planning.api.AthletePlanning;
import com.fitcoach.stats.api.AthleteActivity;
import java.util.UUID;
import org.springframework.stereotype.Service;

/** Tableau de suivi d'un athlete, reserve a ses coachs actifs. */
@Service
public class AthleteOverviewService {

    private static final int UPCOMING_LIMIT = 5;

    private final CoachingService coachingService;
    private final UserDirectory userDirectory;
    private final AthleteActivity athleteActivity;
    private final AthletePlanning athletePlanning;

    public AthleteOverviewService(
            CoachingService coachingService,
            UserDirectory userDirectory,
            AthleteActivity athleteActivity,
            AthletePlanning athletePlanning) {
        this.coachingService = coachingService;
        this.userDirectory = userDirectory;
        this.athleteActivity = athleteActivity;
        this.athletePlanning = athletePlanning;
    }

    public AthleteOverviewResponse overview(UUID coachId, UUID athleteId) {
        if (!coachingService.isActiveClient(coachId, athleteId)) {
            throw new AthleteNotFoundException();
        }
        var athlete = userDirectory.findById(athleteId).orElseThrow(AthleteNotFoundException::new);
        AthleteActivity.Snapshot activity = athleteActivity.snapshot(athleteId);
        return new AthleteOverviewResponse(
                athlete,
                activity.sessionsLast30Days(),
                activity.lastSessionDate(),
                activity.currentStreakDays(),
                athletePlanning.pendingValidationCount(athleteId),
                athletePlanning.upcoming(athleteId, UPCOMING_LIMIT));
    }
}

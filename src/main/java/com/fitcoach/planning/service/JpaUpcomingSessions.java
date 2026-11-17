package com.fitcoach.planning.service;

import com.fitcoach.planning.api.UpcomingSessions;
import com.fitcoach.planning.domain.ScheduledSessionStatus;
import com.fitcoach.planning.repository.ScheduledSessionRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaUpcomingSessions implements UpcomingSessions {

    private final ScheduledSessionRepository scheduledSessionRepository;

    JpaUpcomingSessions(ScheduledSessionRepository scheduledSessionRepository) {
        this.scheduledSessionRepository = scheduledSessionRepository;
    }

    @Override
    public List<PlannedSession> plannedBetween(LocalDate from, LocalDate to) {
        return scheduledSessionRepository
                .findByStatusAndScheduledDateBetween(ScheduledSessionStatus.PLANNED, from, to)
                .stream()
                .map(s -> new PlannedSession(s.getId(), s.getAthleteId(), s.getTitle(), s.getScheduledDate()))
                .toList();
    }
}

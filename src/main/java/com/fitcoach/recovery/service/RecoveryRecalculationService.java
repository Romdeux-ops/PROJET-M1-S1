package com.fitcoach.recovery.service;

import com.fitcoach.recovery.domain.RecoveryAssessment;
import com.fitcoach.recovery.domain.SleepLog;
import com.fitcoach.recovery.event.RecoveryDataChangedEvent;
import com.fitcoach.recovery.repository.RecoveryAssessmentRepository;
import com.fitcoach.recovery.repository.SleepLogRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Recalcule les evaluations de recuperation apres
 * validation des modifications des donnees sources.
 */
@Service
public class RecoveryRecalculationService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    RecoveryRecalculationService.class
            );

    private static final int MAX_BATCH_DAYS = 366;

    private final RecoveryAssessmentService assessmentService;

    private final RecoveryAssessmentRepository assessmentRepository;

    private final SleepLogRepository sleepLogRepository;

    private final Clock clock;

    public RecoveryRecalculationService(
            RecoveryAssessmentService assessmentService,
            RecoveryAssessmentRepository assessmentRepository,
            SleepLogRepository sleepLogRepository,
            Clock clock
    ) {

        this.assessmentService = assessmentService;
        this.assessmentRepository = assessmentRepository;
        this.sleepLogRepository = sleepLogRepository;
        this.clock = clock;
    }

    // ==========================================
    // Reception des evenements
    // ==========================================

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void handleDataChanged(
            RecoveryDataChangedEvent event
    ) {

        LocalDate today = LocalDate.now(clock);

        LocalDate from = resolveStartDate(
                event,
                today
        );

        if (from.isAfter(today)) {
            return;
        }

        LOGGER.debug(
                "Recovery recalculation: user={}, from={}, to={}, reason={}",
                event.userId(),
                from,
                today,
                event.changeType()
        );

        recalculateInBatches(
                event.userId(),
                from,
                today
        );
    }

    // ==========================================
    // Determination de la date de depart
    // ==========================================

    private LocalDate resolveStartDate(
            RecoveryDataChangedEvent event,
            LocalDate today
    ) {

        if (event.changeType() ==
                RecoveryDataChangedEvent.ChangeType.SETTINGS_CHANGED) {

            return findFirstRelevantDate(
                    event.userId(),
                    today
            );
        }

        return event.affectedFrom();
    }

    private LocalDate findFirstRelevantDate(
            UUID userId,
            LocalDate today
    ) {

        LocalDate earliest = today;

        List<RecoveryAssessment> assessments =
                assessmentRepository
                        .findByUserIdAndAssessmentDateBetweenOrderByAssessmentDateAsc(
                                userId,
                                LocalDate.of(1, 1, 1),
                                today
                        );

        if (!assessments.isEmpty()) {

            LocalDate firstAssessmentDate =
                    assessments.getFirst()
                            .getAssessmentDate();

            if (firstAssessmentDate.isBefore(earliest)) {
                earliest = firstAssessmentDate;
            }
        }

        List<SleepLog> sleepLogs =
                sleepLogRepository
                        .findByUserIdAndSleepDateBetweenOrderBySleepDateAsc(
                                userId,
                                LocalDate.of(1, 1, 1),
                                today
                        );

        if (!sleepLogs.isEmpty()) {

            LocalDate firstSleepDate =
                    sleepLogs.getFirst()
                            .getSleepDate();

            if (firstSleepDate.isBefore(earliest)) {
                earliest = firstSleepDate;
            }
        }

        return earliest;
    }

    // ==========================================
    // Recalcul par lots chronologiques
    // ==========================================

    private void recalculateInBatches(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        LocalDate batchStart = from;

        while (!batchStart.isAfter(to)) {

            LocalDate batchEnd =
                    batchStart.plusDays(MAX_BATCH_DAYS - 1);

            if (batchEnd.isAfter(to)) {
                batchEnd = to;
            }

            assessmentService.recalculateRange(
                    userId,
                    batchStart,
                    batchEnd
            );

            batchStart = batchEnd.plusDays(1);
        }
    }
}
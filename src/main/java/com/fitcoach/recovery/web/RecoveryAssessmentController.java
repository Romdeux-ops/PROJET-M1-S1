package com.fitcoach.recovery.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.recovery.dto.RecoveryAssessmentResponse;
import com.fitcoach.recovery.service.RecoveryAssessmentService;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recovery/assessments")
public class RecoveryAssessmentController {

    private final RecoveryAssessmentService assessmentService;

    private final Clock clock;

    public RecoveryAssessmentController(
            RecoveryAssessmentService assessmentService,
            Clock clock
    ) {
        this.assessmentService = assessmentService;
        this.clock = clock;
    }

    @GetMapping
    public List<RecoveryAssessmentResponse> getHistory(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        return assessmentService.getHistory(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }

    @GetMapping("/today")
    public RecoveryAssessmentResponse getToday(
            Authentication authentication
    ) {

        return assessmentService.getAssessment(
                AuthenticatedUsers.id(authentication),
                LocalDate.now(clock)
        );
    }

    @GetMapping("/{date}")
    public RecoveryAssessmentResponse getAssessment(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date

    ) {

        return assessmentService.getAssessment(
                AuthenticatedUsers.id(authentication),
                date
        );
    }

    @PostMapping("/{date}/calculate")
    public RecoveryAssessmentResponse calculateAssessment(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date

    ) {

        return assessmentService.calculateAssessment(
                AuthenticatedUsers.id(authentication),
                date
        );
    }

    @PostMapping("/recalculate")
    public List<RecoveryAssessmentResponse> recalculateRange(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        return assessmentService.recalculateRange(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }
}
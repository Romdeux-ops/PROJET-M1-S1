package com.fitcoach.recovery.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.recovery.dto.RecoveryTrainingSummaryResponse;
import com.fitcoach.recovery.dto.RecoveryWorkoutDetailsRequest;
import com.fitcoach.recovery.dto.RecoveryWorkoutDetailsResponse;
import com.fitcoach.recovery.dto.RecoveryWorkoutResponse;
import com.fitcoach.recovery.service.RecoveryTrainingService;
import com.fitcoach.recovery.service.RecoveryWorkoutDetailsService;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recovery/training")
public class RecoveryTrainingController {

    private final RecoveryTrainingService trainingService;

    private final RecoveryWorkoutDetailsService detailsService;

    public RecoveryTrainingController(
            RecoveryTrainingService trainingService,
            RecoveryWorkoutDetailsService detailsService
    ) {
        this.trainingService = trainingService;
        this.detailsService = detailsService;
    }

    // ==========================================
    // Consultation des seances
    // ==========================================

    @GetMapping("/workouts")
    public List<RecoveryWorkoutResponse> getWorkouts(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        return trainingService.getWorkouts(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }

    @GetMapping("/workouts/{workoutSessionId}")
    public RecoveryWorkoutResponse getWorkout(

            Authentication authentication,

            @PathVariable("workoutSessionId")
            UUID workoutSessionId

    ) {

        return trainingService.getWorkout(
                AuthenticatedUsers.id(authentication),
                workoutSessionId
        );
    }

    // ==========================================
    // Syntheses quotidiennes
    // ==========================================

    @GetMapping("/daily")
    public List<RecoveryTrainingSummaryResponse> getDailySummaries(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        return trainingService.getDailySummaries(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }

    @GetMapping("/daily/{date}")
    public RecoveryTrainingSummaryResponse getDailySummary(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date

    ) {

        return trainingService.getDailySummary(
                AuthenticatedUsers.id(authentication),
                date
        );
    }

    // ==========================================
    // Informations complementaires Recovery
    // ==========================================

    @GetMapping("/workouts/{workoutSessionId}/details")
    public RecoveryWorkoutDetailsResponse getDetails(

            Authentication authentication,

            @PathVariable("workoutSessionId")
            UUID workoutSessionId

    ) {

        return detailsService.getDetails(
                AuthenticatedUsers.id(authentication),
                workoutSessionId
        );
    }

    @PutMapping("/workouts/{workoutSessionId}/details")
    public RecoveryWorkoutDetailsResponse saveDetails(

            Authentication authentication,

            @PathVariable("workoutSessionId")
            UUID workoutSessionId,

            @Valid @RequestBody
            RecoveryWorkoutDetailsRequest request

    ) {

        return detailsService.saveDetails(
                AuthenticatedUsers.id(authentication),
                workoutSessionId,
                request
        );
    }

    @DeleteMapping("/workouts/{workoutSessionId}/details")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDetails(

            Authentication authentication,

            @PathVariable("workoutSessionId")
            UUID workoutSessionId

    ) {

        detailsService.deleteDetails(
                AuthenticatedUsers.id(authentication),
                workoutSessionId
        );
    }
}
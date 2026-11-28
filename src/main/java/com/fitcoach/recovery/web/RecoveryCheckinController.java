package com.fitcoach.recovery.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.recovery.dto.RecoveryCheckinRequest;
import com.fitcoach.recovery.dto.RecoveryCheckinResponse;
import com.fitcoach.recovery.service.RecoveryCheckinService;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

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
@RequestMapping("/api/recovery/checkins")
public class RecoveryCheckinController {

    private final RecoveryCheckinService checkinService;

    public RecoveryCheckinController(
            RecoveryCheckinService checkinService
    ) {
        this.checkinService = checkinService;
    }

    @GetMapping
    public List<RecoveryCheckinResponse> getCheckins(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        return checkinService.getCheckins(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }

    @GetMapping("/{date}")
    public RecoveryCheckinResponse getCheckin(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date

    ) {

        return checkinService.getCheckin(
                AuthenticatedUsers.id(authentication),
                date
        );
    }

    @PutMapping
    public RecoveryCheckinResponse saveCheckin(

            Authentication authentication,

            @Valid @RequestBody
            RecoveryCheckinRequest request

    ) {

        return checkinService.saveCheckin(
                AuthenticatedUsers.id(authentication),
                request
        );
    }

    @DeleteMapping("/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCheckin(

            Authentication authentication,

            @PathVariable("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date

    ) {

        checkinService.deleteCheckin(
                AuthenticatedUsers.id(authentication),
                date
        );
    }
}
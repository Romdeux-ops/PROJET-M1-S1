package com.fitcoach.recovery.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.recovery.dto.SleepLogRequest;
import com.fitcoach.recovery.dto.SleepLogResponse;
import com.fitcoach.recovery.service.SleepLogService;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recovery/sleep")
public class SleepLogController {

    private final SleepLogService sleepLogService;

    public SleepLogController(
            SleepLogService sleepLogService
    ) {
        this.sleepLogService = sleepLogService;
    }

    @GetMapping
    public List<SleepLogResponse> getSleepLogs(

            Authentication authentication,

            @RequestParam("from")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam("to")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to

    ) {

        return sleepLogService.getSleepLogs(
                AuthenticatedUsers.id(authentication),
                from,
                to
        );
    }

    @GetMapping("/{sleepLogId}")
    public SleepLogResponse getSleepLog(

            Authentication authentication,

            @PathVariable("sleepLogId")
            UUID sleepLogId

    ) {

        return sleepLogService.getSleepLog(
                AuthenticatedUsers.id(authentication),
                sleepLogId
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SleepLogResponse createSleepLog(

            Authentication authentication,

            @Valid @RequestBody
            SleepLogRequest request

    ) {

        return sleepLogService.createSleepLog(
                AuthenticatedUsers.id(authentication),
                request
        );
    }

    @PutMapping("/{sleepLogId}")
    public SleepLogResponse updateSleepLog(

            Authentication authentication,

            @PathVariable("sleepLogId")
            UUID sleepLogId,

            @Valid @RequestBody
            SleepLogRequest request

    ) {

        return sleepLogService.updateSleepLog(
                AuthenticatedUsers.id(authentication),
                sleepLogId,
                request
        );
    }

    @DeleteMapping("/{sleepLogId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSleepLog(

            Authentication authentication,

            @PathVariable("sleepLogId")
            UUID sleepLogId

    ) {

        sleepLogService.deleteSleepLog(
                AuthenticatedUsers.id(authentication),
                sleepLogId
        );
    }
}
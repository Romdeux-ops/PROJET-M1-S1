package com.fitcoach.booking.web;

import com.fitcoach.booking.dto.SlotRequest;
import com.fitcoach.booking.dto.SlotResponse;
import com.fitcoach.booking.service.BookingService;
import com.fitcoach.common.security.AuthenticatedUsers;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/booking/slots")
public class AvailabilitySlotController {

    private final BookingService bookingService;

    public AvailabilitySlotController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<SlotResponse> create(Authentication authentication, @Valid @RequestBody SlotRequest request) {
        SlotResponse response = bookingService.createSlot(AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Creneaux du coach connecte, libres ou reserves. */
    @GetMapping
    @PreAuthorize("hasAuthority('COACH')")
    public List<SlotResponse> listMine(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return bookingService.listCoachSlots(AuthenticatedUsers.id(authentication), from, to);
    }

    /** Creneaux libres et a venir des coachs actifs de l'athlete connecte. */
    @GetMapping("/available")
    public List<SlotResponse> listAvailable(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return bookingService.listAvailableSlots(AuthenticatedUsers.id(authentication), from, to);
    }

    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasAuthority('COACH')")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID slotId) {
        bookingService.deleteSlot(slotId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }
}

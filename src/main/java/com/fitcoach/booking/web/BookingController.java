package com.fitcoach.booking.web;

import com.fitcoach.booking.dto.BookingRequest;
import com.fitcoach.booking.dto.BookingResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/booking/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ATHLETE')")
    public ResponseEntity<BookingResponse> book(
            Authentication authentication, @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.book(AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Reservations de l'utilisateur connecte, cote athlete comme cote coach. */
    @GetMapping
    public List<BookingResponse> list(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return bookingService.listBookings(AuthenticatedUsers.id(authentication), from, to);
    }

    @PatchMapping("/{bookingId}/cancel")
    public BookingResponse cancel(Authentication authentication, @PathVariable UUID bookingId) {
        return bookingService.cancel(bookingId, AuthenticatedUsers.id(authentication));
    }
}

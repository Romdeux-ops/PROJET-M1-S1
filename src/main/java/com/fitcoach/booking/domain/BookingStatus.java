package com.fitcoach.booking.domain;

/** Statut d'une reservation (colonne {@code bookings.status}, V9). CONFIRMED vers CANCELLED uniquement. */
public enum BookingStatus {
    CONFIRMED,
    CANCELLED
}

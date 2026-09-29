/**
 * Reservation de creneaux avec un coach.
 *
 * <p>Le coach publie ses disponibilites, l'athlete reserve. Le double-booking
 * est interdit par une contrainte d'exclusion PostgreSQL plutot que par une
 * verification applicative, seule facon de rester correct sous acces
 * concurrent. Tous les horaires sont manipules en {@code timestamptz}.
 *
 * <p>Tables : {@code availability_slots}, {@code bookings}.
 *
 * <p>Phase 9.
 */
package com.fitcoach.booking;

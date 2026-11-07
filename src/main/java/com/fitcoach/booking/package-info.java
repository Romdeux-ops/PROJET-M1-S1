/**
 * Reservation de creneaux avec un coach.
 *
 * <p>Le coach publie des creneaux fixes (15 min a 4 h, immuables une fois
 * publies), un athlete suivi par ce coach en reserve un entier. La reservation
 * est confirmee immediatement et reste annulable par l'athlete ou le coach
 * jusqu'a 24 h avant son debut ; l'annulation libere le creneau.
 *
 * <p>Le double-booking est interdit par la base plutot que par une
 * verification applicative, seule facon de rester correct sous acces
 * concurrent : chevauchement des creneaux d'un coach et des reservations d'un
 * athlete (contraintes d'exclusion {@code gist}), une seule reservation
 * confirmee par creneau (index unique partiel). Tous les horaires sont
 * manipules en {@code timestamptz}.
 *
 * <p>Tables : {@code availability_slots}, {@code bookings}.
 *
 * <p>Phase 9.
 */
package com.fitcoach.booking;

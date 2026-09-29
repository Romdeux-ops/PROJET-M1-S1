/**
 * Badges, experience, classements et defis.
 *
 * <p>Les gains d'experience sont stockes en journal append-only : le niveau est
 * recalcule a partir des evenements plutot que stocke, ce qui evite toute
 * derive entre le total affiche et son historique.
 *
 * <p>Tables : {@code badges}, {@code user_badges}, {@code xp_events},
 * {@code challenges}, {@code challenge_participations}.
 *
 * <p>Phase 11.
 */
package com.fitcoach.gamification;

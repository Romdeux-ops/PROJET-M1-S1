/**
 * Planification des seances dans le calendrier.
 *
 * <p>Fait le lien entre un jour de programme et une date reelle : vue
 * hebdomadaire, seance du jour, jours de repos, report d'une seance manquee.
 * Une seance planifiee est rattachee a la seance realisee correspondante une
 * fois celle-ci terminee.
 *
 * <p>Tables : {@code scheduled_sessions}.
 *
 * <p>Seances privees a leur auteur. Statuts : {@code PLANNED}, {@code
 * PENDING_VALIDATION} (terminee par l'athlete, en attente de validation par
 * son coach actif), {@code DONE} (validee, ou auto-validee si l'athlete n'a
 * pas de coach), {@code SKIPPED}.
 *
 * <p>Phase 6.
 */
package com.fitcoach.planning;

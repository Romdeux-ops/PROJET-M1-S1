/**
 * Relation coach / athlete et portail de suivi.
 *
 * <p>Cycle de vie de l'invitation (le coach invite, l'athlete accepte ou
 * refuse, l'un ou l'autre peut mettre fin a une relation active), tableau de
 * suivi d'un athlete pour son coach, notes privees du coach.
 *
 * <p>Porte la regle d'autorisation la plus sensible du projet : un coach
 * n'accede qu'aux donnees de ses athletes au statut actif (PENDING, DECLINED et
 * ENDED n'ouvrent aucun droit). Toute lecture transverse doit passer par ce
 * package, via {@code api.CoachRelations}.
 *
 * <p>Les notes ne sont jamais visibles de l'athlete et le tableau de suivi
 * s'appuie sur les facades {@code stats.api} et {@code planning.api}.
 *
 * <p>Tables : {@code coach_athlete} (V3, etendue en V13), {@code coach_posts}
 * (V3), {@code coach_notes} (V13).
 *
 * <p>Phase 8.
 */
package com.fitcoach.coaching;

/**
 * Relation coach / athlete et portail de suivi.
 *
 * <p>Cycle de vie de l'invitation, tableau listant les sportifs d'un coach avec
 * leur derniere activite, notes laissees par le coach sur un athlete ou un
 * programme.
 *
 * <p>Porte la regle d'autorisation la plus sensible du projet : un coach
 * n'accede qu'aux donnees de ses athletes au statut actif. Toute lecture
 * transverse doit passer par ce package.
 *
 * <p>Tables : {@code coach_athlete}, {@code coach_notes}.
 *
 * <p>Phase 8.
 */
package com.fitcoach.coaching;

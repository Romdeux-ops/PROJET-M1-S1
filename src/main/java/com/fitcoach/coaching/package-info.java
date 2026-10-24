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
 * <p><b>Anticipe des la phase 2</b> (migration V3) : une version minimale de
 * {@code coach_athlete} (sans flux d'invitation, relation nee ACTIVE) et la
 * table {@code coach_posts} existent deja, necessaires pour restreindre la
 * visibilite des publications d'un coach a ses seuls clients. Le cycle de vie
 * complet de l'invitation (PENDING, refus, {@code coach_notes}) reste a
 * construire en phase 8.
 *
 * <p>Tables : {@code coach_athlete}, {@code coach_posts}, {@code coach_notes}
 * (a venir).
 *
 * <p>Phase 8.
 */
package com.fitcoach.coaching;

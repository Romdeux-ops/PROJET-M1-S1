/**
 * FitMatch : rencontres sportives entre athletes et coachs.
 *
 * <p>Chaque utilisateur cree un profil de rencontre (sports, disponibilites,
 * mode presentiel ou a distance, ville, tarif ou budget). Les donnees deja
 * connues du compte (prenom, age, taille, objectif, niveau, photo) sont lues
 * via {@code identity.api.UserProfiles}, jamais recopiees. Un athlete ne voit
 * que des coachs et inversement, tries par score de compatibilite sportive.
 *
 * <p>Deux LIKE reciproques forment un match. La detection est serialisee par
 * paire (verrou consultatif PostgreSQL) : deux swipes croises simultanes
 * produisent exactement un match. Un match ouvre la messagerie entre les deux
 * personnes ({@link com.fitcoach.matching.api.MatchRelations}) sans creer de
 * relation de coaching ; le defaire ferme l'envoi de messages.
 *
 * <p>Tables : {@code match_profiles}, {@code match_swipes}, {@code matches}.
 *
 * <p>Hors plan initial, a la suite de la phase 10.
 */
package com.fitcoach.matching;

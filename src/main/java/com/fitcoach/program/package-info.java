/**
 * Programmes d'entrainement et leur prescription.
 *
 * <p>Un programme porte une categorie (cardio, musculation, yoga, HIIT,
 * stretching), un niveau, une visibilite (publique, privee, ou {@code CLIENTS} :
 * visible des seuls athletes en relation ACTIVE avec le coach proprietaire,
 * reservee aux coachs) et un jeton de partage. Il se decompose en jours ordonnes (dont des jours de repos), chaque
 * jour prescrivant des exercices ordonnes. Inclut la duplication en copie
 * profonde et la notation par etoiles.
 *
 * <p>L'ordre est porte par une colonne {@code position} : le drag and drop du
 * frontend se resume alors a un PATCH de positions.
 *
 * <p>Tables : {@code programs}, {@code program_days}, {@code program_exercises},
 * {@code program_ratings}.
 *
 * <p>Visibilite publique accessible en lecture a tout utilisateur connecte (et
 * via lien de partage sans authentification) ; la visibilite {@code CLIENTS}
 * est relue a chaque requete aupres de la relation coach / athlete, donc l'acces
 * cesse des que la relation prend fin ; creation, modification et
 * suppression reservees au proprietaire du programme.
 *
 * <p>Phase 4.
 */
package com.fitcoach.program;

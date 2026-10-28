/**
 * Carnet d'entrainement : ce qui a reellement ete realise.
 *
 * <p>Distinction structurante avec {@code program}, qui decrit ce qui est
 * prevu. Une seance enregistre les series effectuees (reps, charge, RPE, repos
 * reel) et le ressenti de l'athlete. C'est ici que vivent le calcul du volume
 * (tonnage et ventilation par groupe musculaire), l'estimation du 1RM et la
 * detection des records personnels.
 *
 * <p>Tables : {@code workout_sessions}, {@code session_sets},
 * {@code personal_records}.
 *
 * <p>Seances strictement privees a leur auteur (aucun partage). Deux records
 * personnels par exercice sont maintenus a jour a chaque serie enregistree :
 * charge maximale et 1RM estime (formule d'Epley).
 *
 * <p>Phase 5.
 */
package com.fitcoach.training;

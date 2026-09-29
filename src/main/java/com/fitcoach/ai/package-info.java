/**
 * Generation de programmes personnalises.
 *
 * <p>Deux implementations derriere une meme interface : une strategie a base de
 * regles, deterministe et testable, qui fonctionne hors ligne et garantit une
 * demonstration fiable, et une strategie appuyee sur un modele de langage.
 *
 * <p>Contrainte de securite : la sortie du modele est un JSON valide contre un
 * schema puis convertie en entites du package {@code program}. Le modele ne
 * produit jamais de SQL et n'ecrit jamais directement en base.
 *
 * <p>Phase 12.
 */
package com.fitcoach.ai;

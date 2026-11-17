/**
 * Generation de programmes personnalises.
 *
 * <p>Deux generateurs derriere {@code POST /api/ai/program-generation} : un
 * generateur a base de regles ({@code RuleBasedProgramGenerator}), deterministe,
 * sans appel reseau, qui compose les seances a partir des groupes musculaires
 * primaires du catalogue reel ; et un modele de langage (Claude, via l'API
 * Messages). {@code fitcoach.ai.strategy} choisit : {@code auto} (defaut) prend
 * Claude si {@code ANTHROPIC_API_KEY} est renseignee, sinon les regles ;
 * {@code rules} et {@code claude} forcent l'un des deux. Un echec de Claude reste
 * un 503, sans repli silencieux.
 *
 * <p>Contrainte de securite : les deux brouillons passent par le meme
 * {@code ProgramDraftParser} (exercices du catalogue uniquement, series, repetitions
 * et repos bornes). Le module ne produit jamais de SQL et n'ecrit jamais en base :
 * l'enregistrement passe par l'API des programmes.
 *
 * <p>Phase 12.
 */
package com.fitcoach.ai;

package com.fitcoach.ai.service;

/** Port vers le modele de langage : seule cette interface connait le fournisseur. */
public interface LanguageModel {

    /** Faux tant que la cle d'API n'est pas fournie ; le reste de l'application demarre quand meme. */
    boolean isConfigured();

    /**
     * Renvoie le texte JSON produit par le modele, contraint par le schema donne.
     *
     * @throws com.fitcoach.ai.exception.AiGenerationFailedException si le modele est injoignable ou refuse
     */
    String generateJson(String system, String user, String jsonSchema);
}

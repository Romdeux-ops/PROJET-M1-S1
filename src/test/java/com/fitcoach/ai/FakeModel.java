package com.fitcoach.ai;

import com.fitcoach.ai.dto.GenerationGoal;
import com.fitcoach.ai.dto.ProgramGenerationRequest;
import com.fitcoach.ai.service.LanguageModel;
import com.fitcoach.ai.dto.GenerationLevel;

/** Modele de langage factice : renvoie une sortie figee et memorise le dernier prompt recu. */
final class FakeModel implements LanguageModel {

    private final String output;
    private final boolean configured;
    String lastUserPrompt;

    FakeModel(String output, boolean configured) {
        this.output = output;
        this.configured = configured;
    }

    static ProgramGenerationRequest request(int sessionsPerWeek) {
        return new ProgramGenerationRequest(GenerationGoal.MUSCLE_GAIN, GenerationLevel.BEGINNER, sessionsPerWeek, null, null);
    }

    @Override
    public boolean isConfigured() {
        return configured;
    }

    @Override
    public String generateJson(String system, String user, String jsonSchema) {
        this.lastUserPrompt = user;
        return output;
    }
}

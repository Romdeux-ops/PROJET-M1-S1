package com.fitcoach.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fitcoach.ai.dto.GeneratedProgramResponse;
import com.fitcoach.ai.exception.AiGenerationFailedException;
import com.fitcoach.ai.service.ProgramGenerationService;
import com.fitcoach.catalog.api.CatalogExercise;
import com.fitcoach.catalog.api.ExerciseCatalog;
import com.fitcoach.ai.dto.GenerationCategory;
import com.fitcoach.ai.dto.GenerationLevel;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/**
 * La sortie du modele n'est jamais crue : on verifie ici, sans appeler l'API
 * reelle, que le brouillon renvoye ne contient que des exercices du catalogue,
 * dans les bornes de l'API des programmes.
 */
class ProgramDraftParserTests {

    private static final UUID SQUAT = UUID.randomUUID();
    private static final UUID BENCH = UUID.randomUUID();

    private final ExerciseCatalog catalog = new ExerciseCatalog() {
        @Override
        public boolean exists(UUID exerciseId) {
            return SQUAT.equals(exerciseId) || BENCH.equals(exerciseId);
        }

        @Override
        public Map<UUID, String> namesOf(Collection<UUID> exerciseIds) {
            return Map.of();
        }

        @Override
        public List<CatalogExercise> listAll() {
            return List.of(
                    new CatalogExercise(SQUAT, "Squat", "BEGINNER", List.of("Quadriceps"), List.of("compound")),
                    new CatalogExercise(BENCH, "Developpe couche", "BEGINNER", List.of("Pectoraux"), List.of()));
        }
    };

    private GeneratedProgramResponse generate(String modelOutput, int sessionsPerWeek) {
        ProgramGenerationService service = new ProgramGenerationService(new FakeModel(modelOutput, true), catalog);
        return service.generate(FakeModel.request(sessionsPerWeek));
    }

    @Test
    void keepsOnlyCatalogExercisesAndClampsValues() {
        String json = """
                {"name":"Full body","description":"Programme debutant","category":"STRENGTH","days":[
                  {"label":"Jour A","exercises":[
                    {"exerciseId":"%s","sets":50,"reps":"8 - 12","restSeconds":9999},
                    {"exerciseId":"%s","sets":3,"reps":"beaucoup","restSeconds":90},
                    {"exerciseId":"%s","sets":3,"reps":"10","restSeconds":60},
                    {"exerciseId":"pas-un-uuid","sets":3,"reps":"10","restSeconds":60}
                  ]}
                ]}
                """.formatted(SQUAT, BENCH, UUID.randomUUID());

        GeneratedProgramResponse draft = generate(json, 3);

        assertThat(draft.days()).hasSize(1);
        assertThat(draft.days().get(0).exercises()).hasSize(2);
        GeneratedProgramResponse.Item squat = draft.days().get(0).exercises().get(0);
        assertThat(squat.exerciseName()).isEqualTo("Squat");
        assertThat(squat.sets()).isEqualTo(10);
        assertThat(squat.reps()).isEqualTo("8-12");
        assertThat(squat.restSeconds()).isEqualTo(600);
        assertThat(draft.days().get(0).exercises().get(1).reps()).isEqualTo("10");
        assertThat(draft.level()).isEqualTo(GenerationLevel.BEGINNER);
    }

    @Test
    void dropsEmptyDaysAndCapsDaysAtSessionsPerWeek() {
        String json = """
                {"name":"P","description":"d","category":"NOPE","days":[
                  {"label":"Vide","exercises":[{"exerciseId":"%s","sets":3,"reps":"10","restSeconds":60}]},
                  {"label":"Inconnu","exercises":[{"exerciseId":"%s","sets":3,"reps":"10","restSeconds":60}]},
                  {"label":"Surplus","exercises":[{"exerciseId":"%s","sets":3,"reps":"10","restSeconds":60}]}
                ]}
                """.formatted(SQUAT, UUID.randomUUID(), BENCH);

        GeneratedProgramResponse draft = generate(json, 1);

        assertThat(draft.days()).hasSize(1);
        assertThat(draft.days().get(0).label()).isEqualTo("Vide");
        assertThat(draft.category()).isEqualTo(GenerationCategory.STRENGTH);
        assertThat(draft.name()).isEqualTo("Programme genere");
    }

    @Test
    void rejectsInvalidJsonAndDraftsWithoutValidExercise() {
        assertThatThrownBy(() -> generate("ceci n'est pas du JSON", 3)).isInstanceOf(AiGenerationFailedException.class);
        assertThatThrownBy(() -> generate("{\"name\":\"x\",\"days\":[]}", 3))
                .isInstanceOf(AiGenerationFailedException.class);
        assertThatThrownBy(() -> generate(
                        "{\"name\":\"x\",\"days\":[{\"label\":\"A\",\"exercises\":[{\"exerciseId\":\""
                                + UUID.randomUUID() + "\",\"sets\":3,\"reps\":\"10\",\"restSeconds\":60}]}]}",
                        3))
                .isInstanceOf(AiGenerationFailedException.class);
    }
}

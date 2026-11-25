package com.fitcoach.ai.service;

import com.fitcoach.ai.dto.GeneratedProgramResponse;
import com.fitcoach.ai.dto.GenerationGoal;
import com.fitcoach.ai.dto.GenerationLevel;
import com.fitcoach.ai.dto.GenerationSource;
import com.fitcoach.ai.dto.ProgramGenerationRequest;
import com.fitcoach.ai.exception.AiGenerationFailedException;
import com.fitcoach.catalog.api.CatalogExercise;
import com.fitcoach.catalog.api.ExerciseCatalog;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * Generateur deterministe, sans appel reseau : compose les seances a partir des
 * groupes musculaires primaires du vrai catalogue. A entree et {@code variant}
 * egaux, la sortie est identique ; {@code variant} fait tourner la selection.
 * Le brouillon repasse par {@link ProgramDraftParser}, comme celui du modele.
 */
@Component
public class RuleBasedProgramGenerator {

    private static final int MIN_EXERCISES = 4;
    private static final int MAX_EXERCISES = 6;
    private static final int MIN_AFTER_FILTER = 3;
    private static final int MIN_RECOVERY_CANDIDATES = 3;
    /** Le catalogue de base n'a que deux exercices de recuperation de niveau debutant. */
    private static final int MIN_RECOVERY_CANDIDATES_BEGINNER = 2;
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private static final Set<String> LOWER_BODY = Set.of("QUADS", "HAMSTRINGS", "GLUTES", "CALVES");
    private static final Set<String> ARMS_AND_CHEST = Set.of("CHEST", "SHOULDERS", "BICEPS", "TRICEPS");

    private enum DayType {
        FULL_A("Full body A", List.of("QUADS", "CHEST", "BACK", "SHOULDERS", "ABS", "BICEPS")),
        FULL_B("Full body B", List.of("HAMSTRINGS", "BACK", "CHEST", "SHOULDERS", "TRICEPS", "ABS")),
        FULL_C("Full body C", List.of("QUADS", "BACK", "SHOULDERS", "CHEST", "BICEPS", "CALVES")),
        UPPER_A("Haut du corps", List.of("CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS")),
        UPPER_B("Haut du corps", List.of("BACK", "CHEST", "SHOULDERS", "TRICEPS", "BICEPS", "ABS")),
        LOWER_A("Bas du corps", List.of("QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "ABS")),
        LOWER_B("Bas du corps", List.of("GLUTES", "QUADS", "HAMSTRINGS", "CALVES", "ABS")),
        PUSH("Poussée", List.of("CHEST", "SHOULDERS", "CHEST", "TRICEPS", "SHOULDERS")),
        PULL("Tirage", List.of("BACK", "BACK", "BICEPS", "BACK", "ABS")),
        LEGS("Jambes", List.of("QUADS", "HAMSTRINGS", "GLUTES", "QUADS", "CALVES", "ABS")),
        RECOVERY("Mobilité / récupération active", List.of());

        final String title;
        final List<String> targets;

        DayType(String title, List<String> targets) {
            this.title = title;
            this.targets = targets;
        }

        /** Une seance haut du corps refuse un exercice dont un muscle primaire est une jambe ; une seance bas du corps, ceux de poitrine, epaules et bras. */
        boolean accepts(CatalogExercise exercise) {
            return switch (this) {
                case UPPER_A, UPPER_B, PUSH, PULL ->
                    exercise.primaryMuscleCodes().stream().noneMatch(LOWER_BODY::contains);
                case LOWER_A, LOWER_B, LEGS ->
                    exercise.primaryMuscleCodes().stream().noneMatch(ARMS_AND_CHEST::contains);
                default -> true;
            };
        }
    }

    private record Prescription(int sets, String reps, int restSeconds) {}

    private final ExerciseCatalog exerciseCatalog;

    public RuleBasedProgramGenerator(ExerciseCatalog exerciseCatalog) {
        this.exerciseCatalog = exerciseCatalog;
    }

    public GeneratedProgramResponse generate(ProgramGenerationRequest request) {
        List<CatalogExercise> catalog = exerciseCatalog.listAll();
        Map<UUID, String> names =
                catalog.stream().collect(Collectors.toMap(CatalogExercise::id, CatalogExercise::name));
        Set<String> allowedDifficulties = allowedDifficulties(request.level());
        List<CatalogExercise> levelPool = catalog.stream()
                .filter(e -> !e.primaryMuscleCodes().isEmpty())
                .filter(e -> allowedDifficulties.contains(e.difficulty()))
                .sorted(Comparator.comparing(CatalogExercise::name).thenComparing(CatalogExercise::id))
                .toList();
        if (levelPool.isEmpty()) {
            throw new AiGenerationFailedException(
                    "Aucun exercice du catalogue ne convient a ce niveau : generation impossible.");
        }

        EquipmentMatcher equipment = EquipmentMatcher.from(request.equipment());
        List<CatalogExercise> equipmentPool =
                levelPool.stream().filter(equipment::allows).toList();

        int variant = request.variantOrZero();
        List<DayType> plan = plan(request.sessionsPerWeek(), request.level(), levelPool);
        boolean relaxed = false;

        ArrayNode daysJson = MAPPER.createArrayNode();
        int dayNumber = 0;
        for (int index = 0; index < plan.size(); index++) {
            DayType type = plan.get(index);
            int sameTitleBefore = (int) plan.subList(0, index).stream()
                    .filter(earlier -> earlier.title.equals(type.title))
                    .count();
            int offset = variant + sameTitleBefore;
            List<CatalogExercise> selected;
            if (type == DayType.RECOVERY) {
                selected = recoveryExercises(levelPool, offset);
            } else {
                selected = pick(type, equipmentPool, offset, List.of(), MAX_EXERCISES);
                if (equipment.isActive() && selected.size() < MIN_AFTER_FILTER) {
                    selected = pick(type, levelPool, offset, selected, MIN_EXERCISES);
                    relaxed = true;
                }
            }
            if (selected.isEmpty()) {
                continue;
            }
            dayNumber++;
            ObjectNode day = daysJson.addObject();
            day.put("label", "Jour " + dayNumber + " – " + type.title);
            ArrayNode items = day.putArray("exercises");
            for (CatalogExercise exercise : selected) {
                Prescription prescription = type == DayType.RECOVERY
                        ? new Prescription(2, "10-15", 30)
                        : prescribe(request.goal(), request.level(), isCompound(exercise));
                ObjectNode item = items.addObject();
                item.put("exerciseId", exercise.id().toString());
                item.put("sets", prescription.sets());
                item.put("reps", prescription.reps());
                item.put("restSeconds", prescription.restSeconds());
            }
        }

        ObjectNode root = MAPPER.createObjectNode();
        int generatedDays = daysJson.size();
        root.put("name", name(request, generatedDays));
        root.put("description", description(request, generatedDays, equipment.isActive(), relaxed));
        root.put("category", request.goal() == GenerationGoal.ENDURANCE ? "CARDIO" : "STRENGTH");
        root.set("days", daysJson);
        return ProgramDraftParser.parse(
                MAPPER.writeValueAsString(root), names, request.level(), request.sessionsPerWeek(), GenerationSource.RULES);
    }

    private static List<DayType> plan(int sessionsPerWeek, GenerationLevel level, List<CatalogExercise> levelPool) {
        List<DayType> plan =
                switch (sessionsPerWeek) {
                    case 1 -> List.of(DayType.FULL_A);
                    case 2 -> List.of(DayType.FULL_A, DayType.FULL_B);
                    case 3 -> List.of(DayType.FULL_A, DayType.FULL_B, DayType.FULL_C);
                    case 4 -> List.of(DayType.UPPER_A, DayType.LOWER_A, DayType.UPPER_B, DayType.LOWER_B);
                    case 5 -> List.of(DayType.PUSH, DayType.PULL, DayType.LEGS, DayType.UPPER_B, DayType.LOWER_B);
                    default -> List.of(DayType.PUSH, DayType.PULL, DayType.LEGS, DayType.PUSH, DayType.PULL, DayType.LEGS);
                };
        int minRecovery = level == GenerationLevel.BEGINNER ? MIN_RECOVERY_CANDIDATES_BEGINNER : MIN_RECOVERY_CANDIDATES;
        if (sessionsPerWeek >= 7 && recoveryCandidates(levelPool).size() >= minRecovery) {
            List<DayType> withRecovery = new ArrayList<>(plan);
            withRecovery.add(DayType.RECOVERY);
            return withRecovery;
        }
        return plan;
    }

    /** Un exercice par groupe cible (le premier de preference polyarticulaire), complete jusqu'a la limite. */
    private static List<CatalogExercise> pick(
            DayType type, List<CatalogExercise> fullPool, int offset, List<CatalogExercise> already, int limit) {
        List<CatalogExercise> pool = fullPool.stream().filter(type::accepts).toList();
        List<CatalogExercise> result = new ArrayList<>(already);
        Set<UUID> used = result.stream().map(CatalogExercise::id).collect(Collectors.toCollection(HashSet::new));

        for (String target : type.targets) {
            if (result.size() >= limit) {
                break;
            }
            List<CatalogExercise> candidates = pool.stream()
                    .filter(e -> !used.contains(e.id()) && e.primaryMuscleCodes().contains(target))
                    .toList();
            if (result.isEmpty()) {
                List<CatalogExercise> compounds = candidates.stream().filter(RuleBasedProgramGenerator::isCompound).toList();
                if (!compounds.isEmpty()) {
                    candidates = compounds;
                }
            }
            if (!candidates.isEmpty()) {
                CatalogExercise chosen = candidates.get(Math.floorMod(offset, candidates.size()));
                result.add(chosen);
                used.add(chosen.id());
            }
        }

        Set<String> targets = new HashSet<>(type.targets);
        List<CatalogExercise> spare = pool.stream()
                .filter(e -> !used.contains(e.id()) && e.primaryMuscleCodes().stream().anyMatch(targets::contains))
                .toList();
        List<CatalogExercise> remaining = new ArrayList<>(spare);
        while (result.size() < Math.min(limit, MIN_EXERCISES) && !remaining.isEmpty()) {
            result.add(remaining.remove(Math.floorMod(offset, remaining.size())));
        }

        List<CatalogExercise> ordered = new ArrayList<>(result);
        ordered.sort(Comparator.comparing((CatalogExercise e) -> !isCompound(e)));
        return ordered;
    }

    private static List<CatalogExercise> recoveryCandidates(List<CatalogExercise> pool) {
        return pool.stream()
                .filter(e -> e.tagCodes().contains("MOBILITY")
                        || e.tagCodes().contains("CARDIO")
                        || (e.primaryMuscleCodes().contains("ABS") && e.tagCodes().contains("BODYWEIGHT")))
                .toList();
    }

    private static List<CatalogExercise> recoveryExercises(List<CatalogExercise> pool, int offset) {
        List<CatalogExercise> candidates = recoveryCandidates(pool);
        if (candidates.isEmpty()) {
            return List.of();
        }
        List<CatalogExercise> rotated = new ArrayList<>();
        int start = Math.floorMod(offset, candidates.size());
        for (int i = 0; i < Math.min(5, candidates.size()); i++) {
            rotated.add(candidates.get((start + i) % candidates.size()));
        }
        return rotated;
    }

    private static boolean isCompound(CatalogExercise exercise) {
        return exercise.tagCodes().contains("COMPOUND");
    }

    private static Set<String> allowedDifficulties(GenerationLevel level) {
        return switch (level) {
            case BEGINNER -> Set.of("BEGINNER");
            case INTERMEDIATE -> Set.of("BEGINNER", "INTERMEDIATE");
            case ADVANCED -> Set.of("BEGINNER", "INTERMEDIATE", "ADVANCED");
        };
    }

    private static Prescription prescribe(GenerationGoal goal, GenerationLevel level, boolean compound) {
        Prescription base =
                switch (goal) {
                    case MUSCLE_GAIN -> compound ? new Prescription(4, "8-10", 90) : new Prescription(3, "10-12", 90);
                    case WEIGHT_LOSS -> compound ? new Prescription(3, "12-15", 60) : new Prescription(3, "12-15", 45);
                    case ENDURANCE -> compound ? new Prescription(3, "15-20", 45) : new Prescription(2, "15-20", 30);
                    case GENERAL_FITNESS -> new Prescription(3, "10-12", 60);
                };
        if (level == GenerationLevel.BEGINNER && !compound) {
            return new Prescription(Math.max(2, base.sets() - 1), base.reps(), base.restSeconds());
        }
        return base;
    }

    private static String name(ProgramGenerationRequest request, int days) {
        return "Programme " + goalLabel(request.goal()) + " — " + days
                + (days > 1 ? " séances" : " séance") + "/semaine (" + levelLabel(request.level()) + ")";
    }

    private static String description(
            ProgramGenerationRequest request, int days, boolean equipmentUsed, boolean relaxed) {
        StringBuilder text = new StringBuilder("Programme généré par règles à partir du catalogue d'exercices (sans IA) : ")
                .append(days)
                .append(days > 1 ? " séances" : " séance")
                .append(" par semaine, objectif ")
                .append(goalLabel(request.goal()))
                .append(", niveau ")
                .append(levelLabel(request.level()))
                .append('.');
        if (days < request.sessionsPerWeek()) {
            text.append(' ')
                    .append(request.sessionsPerWeek())
                    .append(" séances demandées : le catalogue n'a pas assez d'exercices adaptés à ce niveau")
                    .append(" pour les construire toutes, les jours restants sont à garder pour le repos.");
        }
        if (equipmentUsed) {
            text.append(" Le matériel indiqué a été pris en compte.");
        }
        if (relaxed) {
            text.append(" Le matériel indiqué était trop restrictif pour certaines séances : des exercices hors matériel ont été ajoutés.");
        }
        if (request.constraints() != null && !request.constraints().isBlank()) {
            text.append(" Vos contraintes libres ne sont pas interprétées par le générateur à règles : vérifiez que les exercices vous conviennent.");
        }
        if (request.variantOrZero() > 0) {
            text.append(" Variante ").append(request.variantOrZero() + 1).append('.');
        }
        return text.toString();
    }

    private static String goalLabel(GenerationGoal goal) {
        return switch (goal) {
            case MUSCLE_GAIN -> "prise de masse";
            case WEIGHT_LOSS -> "perte de poids";
            case ENDURANCE -> "endurance";
            case GENERAL_FITNESS -> "forme générale";
        };
    }

    private static String levelLabel(GenerationLevel level) {
        return switch (level) {
            case BEGINNER -> "débutant";
            case INTERMEDIATE -> "intermédiaire";
            case ADVANCED -> "avancé";
        };
    }
}

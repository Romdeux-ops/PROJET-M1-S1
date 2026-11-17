package com.fitcoach.ai.service;

import com.fitcoach.ai.dto.GeneratedProgramResponse;
import com.fitcoach.ai.dto.GeneratedProgramResponse.Day;
import com.fitcoach.ai.dto.GeneratedProgramResponse.Item;
import com.fitcoach.ai.exception.AiGenerationFailedException;
import com.fitcoach.ai.dto.GenerationCategory;
import com.fitcoach.ai.dto.GenerationLevel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Transforme la sortie du modele en brouillon sur. Rien de ce que dit le modele
 * n'est cru : un exercice absent du catalogue est retire, les series, repetitions
 * et repos sont ramenes aux bornes de l'API des programmes.
 */
final class ProgramDraftParser {

    static final int MAX_EXERCISES_PER_DAY = 12;
    private static final Pattern REPS = Pattern.compile("\\d{1,3}(-\\d{1,3})?");
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private ProgramDraftParser() {}

    static GeneratedProgramResponse parse(
            String json, Map<UUID, String> catalogNames, GenerationLevel level, int sessionsPerWeek) {
        JsonNode root;
        try {
            root = MAPPER.readTree(json);
        } catch (JacksonException e) {
            throw new AiGenerationFailedException("Le modele a renvoye un JSON invalide. Reessayez.");
        }
        JsonNode daysNode = root.path("days");
        if (!daysNode.isArray()) {
            throw new AiGenerationFailedException("Le modele n'a propose aucun jour d'entrainement. Reessayez.");
        }

        List<Day> days = new ArrayList<>();
        for (JsonNode dayNode : daysNode) {
            if (days.size() >= sessionsPerWeek) {
                break;
            }
            List<Item> items = new ArrayList<>();
            for (JsonNode itemNode : dayNode.path("exercises")) {
                if (items.size() >= MAX_EXERCISES_PER_DAY) {
                    break;
                }
                Item item = parseItem(itemNode, catalogNames);
                if (item != null) {
                    items.add(item);
                }
            }
            if (!items.isEmpty()) {
                days.add(new Day(truncate(text(dayNode, "label", "Seance " + (days.size() + 1)), 100), items));
            }
        }
        if (days.isEmpty()) {
            throw new AiGenerationFailedException("Aucun exercice du catalogue dans la reponse du modele. Reessayez.");
        }

        String name = truncate(text(root, "name", ""), 150);
        if (name.length() < 2) {
            name = "Programme genere";
        }
        return new GeneratedProgramResponse(
                name,
                truncate(text(root, "description", ""), 5000),
                category(text(root, "category", "")),
                level,
                List.copyOf(days));
    }

    private static Item parseItem(JsonNode node, Map<UUID, String> catalogNames) {
        UUID id;
        try {
            id = UUID.fromString(text(node, "exerciseId", ""));
        } catch (IllegalArgumentException e) {
            return null;
        }
        String exerciseName = catalogNames.get(id);
        if (exerciseName == null) {
            return null;
        }
        int sets = clamp(node.path("sets").asInt(3), 1, 10);
        int rest = clamp(node.path("restSeconds").asInt(60), 0, 600);
        String reps = text(node, "reps", "10").replace(" ", "");
        if (!REPS.matcher(reps).matches()) {
            reps = "10";
        }
        return new Item(id, exerciseName, sets, reps, rest);
    }

    private static GenerationCategory category(String value) {
        try {
            return GenerationCategory.valueOf(value);
        } catch (IllegalArgumentException e) {
            return GenerationCategory.STRENGTH;
        }
    }

    private static String text(JsonNode node, String field, String fallback) {
        JsonNode value = node.path(field);
        return value.isString() ? value.asString().strip() : fallback;
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}

package com.fitcoach.ai.service;

import com.fitcoach.catalog.api.CatalogExercise;
import java.text.Normalizer;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

/**
 * Rapproche le materiel saisi en texte libre (« halteres et un banc ») du
 * materiel que demande chaque exercice du catalogue. Sans mot reconnu, le filtre
 * est inactif : on ne reduit jamais le catalogue sur une saisie incomprise.
 */
final class EquipmentMatcher {

    enum Gear {
        DUMBBELL,
        BARBELL,
        MACHINE,
        BAND,
        PULLUP_BAR,
        KETTLEBELL,
    }

    private final boolean active;
    private final Set<Gear> owned;

    private EquipmentMatcher(boolean active, Set<Gear> owned) {
        this.active = active;
        this.owned = owned;
    }

    static EquipmentMatcher from(String freeText) {
        String text = normalize(freeText);
        if (text.isBlank()) {
            return new EquipmentMatcher(false, EnumSet.noneOf(Gear.class));
        }
        Set<Gear> owned = EnumSet.noneOf(Gear.class);
        boolean recognized = false;

        if (containsAny(text, "poids du corps", "poids de corps", "bodyweight", "sans materiel", "aucun", "rien")) {
            recognized = true;
        }
        if (containsAny(text, "salle", "gym", "fitness complet", "tout le materiel")) {
            owned.addAll(EnumSet.allOf(Gear.class));
            recognized = true;
        }
        if (containsAny(text, "traction", "pull-up", "pullup", "pull up")) {
            owned.add(Gear.PULLUP_BAR);
            recognized = true;
            text = text.replace("barre de traction", " ").replace("barre traction", " ");
        }
        if (containsAny(text, "halter", "dumbbell")) {
            owned.add(Gear.DUMBBELL);
            recognized = true;
        }
        if (containsAny(text, "barre", "barbell", "rack")) {
            owned.add(Gear.BARBELL);
            recognized = true;
        }
        if (containsAny(text, "machine", "poulie", "cable")) {
            owned.add(Gear.MACHINE);
            recognized = true;
        }
        if (containsAny(text, "elastique", "band")) {
            owned.add(Gear.BAND);
            recognized = true;
        }
        if (containsAny(text, "kettlebell")) {
            owned.add(Gear.KETTLEBELL);
            recognized = true;
        }
        if (containsAny(text, "banc")) {
            recognized = true;
        }
        return new EquipmentMatcher(recognized, owned);
    }

    boolean isActive() {
        return active;
    }

    /** Un exercice au poids du corps passe toujours ; le banc n'est jamais bloquant. */
    boolean allows(CatalogExercise exercise) {
        if (!active) {
            return true;
        }
        return owned.containsAll(required(exercise));
    }

    static Set<Gear> required(CatalogExercise exercise) {
        Set<Gear> required = EnumSet.noneOf(Gear.class);
        String equipment = normalize(exercise.equipment());
        if (equipment.isBlank() || equipment.equals("aucun")) {
            return required;
        }
        if (containsAny(equipment, "traction")) {
            required.add(Gear.PULLUP_BAR);
            equipment = equipment.replace("barre de traction", " ");
        }
        boolean bodyweight = exercise.tagCodes().contains("BODYWEIGHT");
        if (!bodyweight) {
            if (containsAny(equipment, "halter", "dumbbell")) {
                required.add(Gear.DUMBBELL);
            }
            if (containsAny(equipment, "barre", "rack")) {
                required.add(Gear.BARBELL);
            }
            if (containsAny(equipment, "machine", "poulie", "cable")) {
                required.add(Gear.MACHINE);
            }
            if (containsAny(equipment, "elastique", "band")) {
                required.add(Gear.BAND);
            }
            if (containsAny(equipment, "kettlebell")) {
                required.add(Gear.KETTLEBELL);
            }
        }
        return required;
    }

    static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .strip();
    }

    private static boolean containsAny(String text, String... needles) {
        for (String needle : needles) {
            if (text.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}

package com.fitcoach.common.domain;

import com.fitcoach.common.exception.InvalidReorderException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Reordonnancement de listes positionnees.
 *
 * <p>Les positions sont toujours reaffectees de 0 a n-1 : ni trou ni doublon,
 * quel que soit l'historique d'ajouts et de suppressions. Les contraintes
 * {@code UNIQUE (parent, position)} doivent etre {@code DEFERRABLE} pour que
 * l'echange de deux positions passe dans une meme transaction.
 */
public final class Positions {

    private Positions() {}

    /**
     * @param orderedIds permutation exacte des identifiants de {@code items}
     * @throws InvalidReorderException si un element manque, est inconnu ou repete
     */
    public static void applyOrder(List<? extends Positioned> items, List<UUID> orderedIds) {
        Map<UUID, Positioned> byId = items.stream().collect(Collectors.toMap(Positioned::getId, Function.identity()));
        if (orderedIds.size() != items.size() || !byId.keySet().equals(new HashSet<>(orderedIds))) {
            throw new InvalidReorderException();
        }
        for (int position = 0; position < orderedIds.size(); position++) {
            byId.get(orderedIds.get(position)).setPosition(position);
        }
    }

    /** Resserre les positions apres une suppression, en conservant l'ordre courant. */
    public static void compact(List<? extends Positioned> itemsInOrder) {
        for (int position = 0; position < itemsInOrder.size(); position++) {
            itemsInOrder.get(position).setPosition(position);
        }
    }
}

/**
 * Messagerie entre coach et athlete.
 *
 * <p>Une conversation par paire (coach, athlete), creee a la demande et
 * idempotente : l'unicite de la paire est garantie par la base, y compris sous
 * acces concurrent. Seuls ses deux participants la voient. L'ouvrir ou y
 * ecrire exige une relation coach / athlete active ou un match FitMatch actif
 * ({@code matching.api.MatchRelations}) ; une fois les deux termines,
 * l'historique reste lisible mais l'envoi est refuse. Les messages
 * sont immuables (1 a 2000 caracteres).
 *
 * <p>Le contrat est REST : historique pagine par curseur (keyset sur
 * {@code (created_at, id)}, stable quand de nouveaux messages arrivent), envoi
 * par POST, accuse de lecture par conversation ({@code messages.read_at},
 * chaque message n'ayant qu'un destinataire). Le frontend interroge l'API a
 * intervalle regulier ; un transport WebSocket pourra se brancher ensuite comme
 * simple canal de notification, sans modifier ni la persistance ni les DTO.
 *
 * <p>Tables : {@code conversations}, {@code messages}.
 *
 * <p>Phase 10.
 */
package com.fitcoach.messaging;

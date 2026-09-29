/**
 * Messagerie entre coach et athlete.
 *
 * <p>Le contrat est d'abord REST (historique paginable depuis un curseur,
 * envoi par POST, accuses de lecture), ce qui permet au frontend de commencer
 * en polling simple. Le transport WebSocket se branche ensuite par-dessus comme
 * simple canal de notification, sans modifier ni la persistance ni les DTO.
 *
 * <p>Tables : {@code conversations}, {@code messages}.
 *
 * <p>Phase 10.
 */
package com.fitcoach.messaging;

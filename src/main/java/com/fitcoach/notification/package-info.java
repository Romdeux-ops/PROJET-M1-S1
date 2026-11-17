/**
 * Centre de notifications in-app.
 *
 * <p>Notifications privees a leur destinataire (un tiers recoit 404), creees de
 * facon idempotente grace a une cle de deduplication. Sources : un job planifie
 * qui rappelle les seances planifiees aujourd'hui ou demain, et les transitions
 * du planning (seance a valider pour le coach, seance validee pour l'athlete).
 * Les autres modules ne passent que par {@code notification.api.Notifier}.
 *
 * <p>Tables : {@code notifications}.
 */
package com.fitcoach.notification;

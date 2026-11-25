/** Adresse de la page publique d'un coach : la cible du QR code. */
export function publicProfileUrl(coachId: string) {
  return `${window.location.origin}/coach/${coachId}`
}

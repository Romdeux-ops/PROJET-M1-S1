/**
 * Adresse de la page publique d'un coach : la cible du QR code.
 *
 * En dev, `window.location.origin` vaut `localhost`, que le telephone qui scanne ne peut pas ouvrir :
 * renseigner `VITE_PUBLIC_URL` (ex. http://192.168.1.20:5173) pour un QR scannable. En production,
 * l'origine du site convient.
 */
export function publicProfileUrl(coachId: string) {
  const base = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/+$/, '')
  return `${base}/coach/${coachId}`
}

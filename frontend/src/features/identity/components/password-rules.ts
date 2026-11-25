export const RULES = [
  { label: '8 caractères', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un chiffre', test: (p: string) => /\d/.test(p) },
]

/** Nombre de criteres remplis (0 a 3), plus un point bonus pour un mot de passe long avec symbole. */
export function passwordScore(password: string) {
  const base = RULES.filter((rule) => rule.test(password)).length
  const bonus = password.length >= 12 && /[^A-Za-z0-9]/.test(password) ? 1 : 0
  return password.length === 0 ? 0 : Math.min(4, base + bonus)
}

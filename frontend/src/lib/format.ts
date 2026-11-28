const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const numberFormatter = new Intl.NumberFormat('fr-FR')

/** Accepte une date ISO (`2026-09-29` ou `2026-09-29T10:00:00Z`). */
export function formatDate(value: string | Date) {
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value)
}

export function formatShortDate(value: string | Date) {
  return shortDateFormatter.format(typeof value === 'string' ? new Date(value) : value)
}

/** Heure locale `18:30` d'un instant ISO. */
export function formatTime(value: string | Date) {
  return timeFormatter.format(typeof value === 'string' ? new Date(value) : value)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

/** Date du jour au format `yyyy-mm-dd` (valeur d'un input type="date"). */
export function todayIso() {
  return isoInDays(0)
}

/** Date locale dans `days` jours (negatif = passe), au format `yyyy-mm-dd`. */
export function isoInDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

/** Taille stockee en cm, affichee selon la preference d'unites du compte. */
export function formatHeight(heightCm: number, unitSystem: 'METRIC' | 'IMPERIAL' = 'METRIC') {
  if (unitSystem === 'METRIC') return `${formatNumber(heightCm)} cm`
  const totalInches = Math.round(heightCm / 2.54)
  return `${Math.floor(totalInches / 12)} ft ${totalInches % 12} in`
}

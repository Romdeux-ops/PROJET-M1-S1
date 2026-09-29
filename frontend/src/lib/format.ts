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
const numberFormatter = new Intl.NumberFormat('fr-FR')

/** Accepte une date ISO (`2026-09-29` ou `2026-09-29T10:00:00Z`). */
export function formatDate(value: string | Date) {
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value)
}

export function formatShortDate(value: string | Date) {
  return shortDateFormatter.format(typeof value === 'string' ? new Date(value) : value)
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
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

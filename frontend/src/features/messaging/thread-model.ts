import type { Message } from './schemas'

/** Deux messages du meme auteur a moins de cinq minutes forment un groupe. */
const GROUP_GAP_MS = 5 * 60 * 1000

export type ThreadRow =
  | { type: 'day'; key: string; date: string }
  | { type: 'message'; key: string; message: Message; mine: boolean; first: boolean; last: boolean }

function dayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/** Transforme une liste de messages (du plus ancien au plus recent) en lignes d'affichage : separateurs de jour et groupes. */
export function buildThreadRows(messages: Message[], userId: string | undefined): ThreadRow[] {
  const rows: ThreadRow[] = []
  messages.forEach((message, i) => {
    const previous = messages[i - 1]
    const next = messages[i + 1]
    const newDay = !previous || dayKey(previous.sentAt) !== dayKey(message.sentAt)
    if (newDay)
      rows.push({ type: 'day', key: `day-${dayKey(message.sentAt)}`, date: message.sentAt })

    const joinsPrevious =
      !newDay &&
      previous!.senderId === message.senderId &&
      new Date(message.sentAt).getTime() - new Date(previous!.sentAt).getTime() < GROUP_GAP_MS
    const joinsNext =
      !!next &&
      dayKey(next.sentAt) === dayKey(message.sentAt) &&
      next.senderId === message.senderId &&
      new Date(next.sentAt).getTime() - new Date(message.sentAt).getTime() < GROUP_GAP_MS

    rows.push({
      type: 'message',
      key: message.id,
      message,
      mine: message.senderId === userId,
      first: !joinsPrevious,
      last: !joinsNext,
    })
  })
  return rows
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const dayYearFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
const dayMonthShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function daysBetween(from: Date, to: Date) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000)
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Libelle du separateur de jour : Aujourd'hui, Hier, ou la date complete. */
export function dayLabel(iso: string, now: Date = new Date()) {
  const date = new Date(iso)
  const diff = daysBetween(date, now)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  const formatter = date.getFullYear() === now.getFullYear() ? dayFormatter : dayYearFormatter
  return capitalize(formatter.format(date))
}

/** Horodatage compact de la liste : l'heure aujourd'hui, Hier, le jour de la semaine, puis la date. */
export function listTimestamp(iso: string, now: Date = new Date()) {
  const date = new Date(iso)
  const diff = daysBetween(date, now)
  if (diff <= 0) return timeFormatter.format(date)
  if (diff === 1) return 'Hier'
  if (diff < 7) return capitalize(weekdayShort.format(date).replace('.', ''))
  return dayMonthShort.format(date)
}

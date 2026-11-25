import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { Badge } from './schemas'

const STORAGE_KEY = 'fitcoach:seen-badges'

/** Badges obtenus qui n'ont pas encore ete celebres. */
export function findNewBadges(badges: Badge[], seenIds: string[]): Badge[] {
  return badges.filter((b) => b.awardedAt !== null && !seenIds.includes(b.id))
}

function readSeen(userKey: string): string[] {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userKey}`)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function writeSeen(userKey: string, ids: string[]) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${userKey}`, JSON.stringify(ids))
  } catch {
    // Stockage indisponible (navigation privee) : la celebration sera simplement rejouee.
  }
}

/** Annonce (notification) les badges obtenus jamais vus ; renvoie un identifiant si au moins un est nouveau. */
export function announceNewBadges(badges: Badge[], userKey: string): string | null {
  const seen = readSeen(userKey)
  const fresh = findNewBadges(badges, seen)
  if (fresh.length === 0) return null
  writeSeen(userKey, [...seen, ...fresh.map((b) => b.id)])
  for (const badge of fresh)
    toast.success(`Nouveau badge : ${badge.name}`, { description: badge.description })
  return fresh.map((b) => b.id).join(',')
}

/** Celebre une fois chaque nouveau badge (toast) et renvoie un identifiant stable pour les confettis. */
export function useNewBadgeCelebration(badges: Badge[] | undefined, userKey: string) {
  const [seen] = useState(() => readSeen(userKey))
  const notified = useRef(new Set<string>())
  const fresh = useMemo(() => (badges ? findNewBadges(badges, seen) : []), [badges, seen])

  useEffect(() => {
    const toNotify = fresh.filter((b) => !notified.current.has(b.id))
    if (toNotify.length === 0) return
    for (const badge of toNotify) {
      notified.current.add(badge.id)
      toast.success(`Nouveau badge : ${badge.name}`, { description: badge.description })
    }
    writeSeen(userKey, [...readSeen(userKey), ...toNotify.map((b) => b.id)])
  }, [fresh, userKey])

  return fresh.length > 0 ? fresh.map((b) => b.id).join(',') : null
}

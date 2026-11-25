export interface NumericParts {
  value: number
  decimals: number
  suffix: string
}

/** Isole un nombre en tete ("12 j", "7.5/10") ; renvoie null si le texte n'est pas animable ("3h 20"). */
export function splitNumeric(text: string): NumericParts | null {
  const match = /^(\d+(?:[.,]\d+)?)(\/\d+|[^\d]*)$/.exec(text)
  if (!match) return null
  const raw = match[1]!
  const separator = raw.includes(',') ? ',' : '.'
  const decimals = raw.includes(separator) ? raw.length - raw.indexOf(separator) - 1 : 0
  return { value: Number(raw.replace(',', '.')), decimals, suffix: match[2]! }
}

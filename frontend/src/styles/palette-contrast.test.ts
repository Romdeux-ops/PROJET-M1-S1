import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// Vitest s'execute depuis frontend/ : le chemin ne depend pas de l'environnement jsdom.
const css = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf-8')

/** Conversion OKLCH vers luminance relative (sRGB lineaire, valeurs hors gamut ecretees). */
function luminance(L: number, C: number, hue: number) {
  const a = C * Math.cos((hue * Math.PI) / 180)
  const b = C * Math.sin((hue * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  const r = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  const g = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}

function contrast(a: number, b: number) {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

interface Palette {
  hue: number
  pl: number
  plDark: number
  pc: number
}

function variable(block: string, name: string) {
  const match = new RegExp(`--${name}:\\s*([\\d.]+)`).exec(block)
  if (!match) throw new Error(`--${name} introuvable`)
  return Number(match[1])
}

function readPalette(block: string): Palette {
  return {
    hue: variable(block, 'hue'),
    pl: variable(block, 'pl'),
    plDark: variable(block, 'pl-dark'),
    pc: variable(block, 'pc'),
  }
}

const root = /:root\s*\{([^}]*)\}/.exec(css)![1]!
const palettes: Record<string, Palette> = { aurora: readPalette(root) }
for (const name of ['emerald', 'ocean', 'sunset']) {
  const block = new RegExp(`\\[data-palette='${name}'\\]\\s*\\{([^}]*)\\}`).exec(css)
  palettes[name] = readPalette(block![1]!)
}

const WHITE = luminance(0.99, 0, 0)
const DARK_TEXT = luminance(0.14, 0.02, 270)
const AA = 4.5

describe('contraste des palettes (WCAG AA)', () => {
  for (const [name, p] of Object.entries(palettes)) {
    it(`${name} : texte blanc sur le bouton principal en mode clair`, () => {
      expect(contrast(WHITE, luminance(p.pl, p.pc, p.hue))).toBeGreaterThanOrEqual(AA)
    })

    it(`${name} : texte sombre sur le bouton principal en mode sombre`, () => {
      expect(contrast(DARK_TEXT, luminance(p.plDark, p.pc, p.hue))).toBeGreaterThanOrEqual(AA)
    })

    it(`${name} : les deux extremites du degrade de marque restent lisibles en blanc`, () => {
      const start = luminance(p.pl, p.pc, p.hue)
      const end = luminance(p.pl - 0.03, p.pc * 0.85, p.hue - 50)
      expect(contrast(WHITE, start)).toBeGreaterThanOrEqual(AA)
      expect(contrast(WHITE, end)).toBeGreaterThanOrEqual(AA)
    })
  }

  it('le degrade du fichier CSS correspond a la formule verifiee ici', () => {
    expect(css).toContain(
      'oklch(calc(var(--pl) - 0.03) calc(var(--pc) * 0.85) calc(var(--hue) - 50))',
    )
  })
})

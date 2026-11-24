const EXERCISES = [
  'Développé couché',
  'Squat',
  'Soulevé de terre',
  'Tirage horizontal',
  'Hip thrust',
  'Développé militaire',
  'Fentes avant',
  'Pompes',
  'Presse à cuisses',
  'Curl biceps',
  'Planche',
  'Élévations latérales',
]

/** Bandeau incline d'exercices du catalogue qui defile en continu, comme une banniere de salle. */
export function Marquee() {
  const items = [...EXERCISES, ...EXERCISES]
  return (
    <div
      aria-hidden
      className="relative z-10 -my-2 -rotate-2 overflow-hidden bg-brand py-4 text-white shadow-xl shadow-primary/20"
    >
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {items.map((name, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-2xl font-black tracking-tight uppercase italic"
          >
            {name}
            <span className="inline-block size-3 rotate-45 bg-white/70" />
          </span>
        ))}
      </div>
    </div>
  )
}

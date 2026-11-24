/** Fond decoratif : grille de points et trois halos flous qui derivent lentement. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--muted-foreground)_30%,transparent)_1px,transparent_0)] [mask-image:radial-gradient(circle_at_40%_15%,black,transparent_65%)] [background-size:32px_32px] opacity-60" />
      <div className="absolute top-0 -left-8 size-80 animate-blob rounded-full bg-primary/30 blur-3xl dark:bg-primary/25" />
      <div className="absolute top-16 -right-8 size-80 animate-blob rounded-full bg-chart-2/30 blur-3xl [animation-delay:2s] dark:bg-chart-2/20" />
      <div className="absolute bottom-0 left-1/4 size-96 animate-blob rounded-full bg-chart-3/25 blur-3xl [animation-delay:4s] dark:bg-chart-3/15" />
    </div>
  )
}

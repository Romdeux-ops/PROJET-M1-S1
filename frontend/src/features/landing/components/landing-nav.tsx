import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/session'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#chiffres', label: 'En chiffres' },
]

/** Ilot flottant : large en haut de page, il se resserre et s'ombre des que l'on defile. */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const connected = useSession((s) => s.token !== null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4">
      <div
        className={cn(
          'pointer-events-auto flex w-full items-center justify-between rounded-full border py-2 pr-2 pl-4 transition-all duration-500',
          scrolled
            ? 'max-w-3xl border-border bg-background/85 shadow-xl shadow-primary/10 backdrop-blur-xl'
            : 'max-w-5xl border-transparent bg-transparent',
        )}
      >
        <Link
          to="/"
          aria-label="Accueil FitCoach"
          className="transition-transform hover:scale-[1.03]"
        >
          <Logo />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {connected ? (
            <Button asChild size="sm" className="group rounded-full">
              <Link to="/dashboard">
                Mon espace
                <ArrowRight className="transition-transform motion-safe:group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden rounded-full sm:inline-flex"
              >
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm" className="group rounded-full">
                <Link to="/register">
                  Créer un compte
                  <ArrowRight className="transition-transform motion-safe:group-hover:translate-x-1" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

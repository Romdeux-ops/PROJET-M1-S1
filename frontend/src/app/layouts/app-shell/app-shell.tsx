import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect } from 'react'

import { useSession } from '@/lib/auth/session'

import { CommandMenu } from './command-menu'
import { MobileNav } from './mobile-nav'
import { RouteProgress } from './route-progress'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell() {
  const token = useSession((s) => s.token)
  const navigate = useNavigate()
  const pathname = useLocation({ select: (l) => l.pathname })

  // Session perdue (deconnexion, 401 du backend) : retour a l'ecran de connexion.
  useEffect(() => {
    if (!token) void navigate({ to: '/login', replace: true })
  }, [token, navigate])

  return (
    <div className="flex min-h-dvh">
      <RouteProgress />
      <Sidebar />
      <MobileNav />
      <CommandMenu />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

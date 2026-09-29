import { Link } from '@tanstack/react-router'
import { ArrowLeft, Compass } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <p className="text-brand text-8xl font-black tracking-tighter">404</p>
        <div className="mt-6 grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Compass className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mt-2 text-muted-foreground">
          Cette page n’existe pas ou a été déplacée. Pas d’inquiétude, votre progression est
          intacte.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">
            <ArrowLeft /> Retour à l’accueil
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}

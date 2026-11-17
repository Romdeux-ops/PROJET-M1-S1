import { Loader2, UserMinus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EndRelationDialogProps {
  /** Nom de l'autre partie, repris dans la confirmation. */
  name: string
  isPending: boolean
  onConfirm: () => Promise<unknown> | void
}

/** Confirmation avant de mettre fin a une relation active ; l'acces de chacun est perdu immediatement. */
export function EndRelationDialog({ name, isPending, onConfirm }: EndRelationDialogProps) {
  const [open, setOpen] = useState(false)

  async function confirm() {
    try {
      await onConfirm()
      setOpen(false)
    } catch {
      // L'erreur est deja signalee par la notification globale ; le dialogue reste ouvert.
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserMinus className="size-3.5" /> Mettre fin au suivi
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre fin au suivi avec {name} ?</DialogTitle>
            <DialogDescription>
              Les publications privées, les validations de séances et la messagerie ne seront plus
              accessibles entre vous. Une nouvelle invitation sera nécessaire pour reprendre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" disabled={isPending} onClick={confirm}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

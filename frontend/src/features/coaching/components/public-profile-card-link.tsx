import { Link } from '@tanstack/react-router'
import { QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** Affiche au coach, sur sa propre page publique, ou en gerer le contenu et recuperer le QR code. */
export function PublicProfileCardLink() {
  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-muted-foreground">
        C&apos;est votre profil public, tel que les visiteurs le voient.
      </p>
      <Button asChild variant="outline">
        <Link to="/coaching">
          <QrCode /> Modifier ma page et récupérer le QR code
        </Link>
      </Button>
    </div>
  )
}

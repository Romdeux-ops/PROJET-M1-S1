import { Copy, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

const PNG_SIZE = 1024
/** Zone de silence exigee autour d'un QR code (4 modules) : elle fait partie du SVG, donc du PNG exporte. */
const QUIET_ZONE_MODULES = 4

interface QrCodePanelProps {
  /** Adresse encodee dans le QR code. */
  url: string
  /** Nom du fichier telecharge, sans extension. */
  fileName: string
}

/** QR code d'une adresse, avec copie du lien et telechargement en PNG (impression, affiche, carte de visite). */
export function QrCodePanel({ url, fileName }: QrCodePanelProps) {
  const wrapper = useRef<HTMLDivElement>(null)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copié')
    } catch {
      toast.error('Copie impossible : sélectionnez le lien et copiez-le à la main.')
    }
  }

  function downloadPng() {
    const svg = wrapper.current?.querySelector('svg')
    if (!svg) return
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = PNG_SIZE
      canvas.height = PNG_SIZE
      const context = canvas.getContext('2d')
      if (!context) return
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, PNG_SIZE, PNG_SIZE)
      context.drawImage(image, 0, 0, PNG_SIZE, PNG_SIZE)
      const link = document.createElement('a')
      link.download = `${fileName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Fond blanc impose : un QR code se lit mal sur un fond sombre. */}
      <div ref={wrapper} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <QRCodeSVG
          value={url}
          size={208}
          level="M"
          marginSize={QUIET_ZONE_MODULES}
          title="QR code du profil public"
          role="img"
        />
      </div>
      <p className="max-w-full text-center text-xs break-all text-muted-foreground">{url}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void copyLink()}>
          <Copy /> Copier le lien
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={downloadPng}>
          <Download /> Télécharger le QR
        </Button>
      </div>
    </div>
  )
}

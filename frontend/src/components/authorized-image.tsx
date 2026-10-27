import type { ImgHTMLAttributes } from 'react'

import { useAuthorizedImage } from '@/lib/api/use-authorized-image'
import { cn } from '@/lib/utils'

interface AuthorizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Chemin d'un endpoint authentifie, ex. `/api/coaching/posts/images/...`. */
  src: string
}

/** `<img>` pour les images privees : charge le binaire avec le JWT de session. */
export function AuthorizedImage({ src, alt = '', className, ...props }: AuthorizedImageProps) {
  const image = useAuthorizedImage(src)

  if (image.isError) return null
  if (!image.data) {
    return (
      <div aria-hidden className={cn('h-40 w-64 animate-pulse rounded-lg bg-muted', className)} />
    )
  }
  return <img src={image.data} alt={alt} className={className} {...props} />
}

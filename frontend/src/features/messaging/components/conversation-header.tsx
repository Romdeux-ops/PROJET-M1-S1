import { ArrowLeft } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { initials } from '@/lib/utils'

interface ConversationHeaderProps {
  name: string
  onBack: () => void
}

export function ConversationHeader({ name, onBack }: ConversationHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-3">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Retour aux conversations"
        onClick={onBack}
      >
        <ArrowLeft />
      </Button>
      <Avatar size="lg">
        <AvatarFallback className="bg-brand text-sm font-semibold text-white">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h2 className="truncate font-semibold">{name}</h2>
        <p className="text-xs text-muted-foreground">Conversation privée</p>
      </div>
    </header>
  )
}

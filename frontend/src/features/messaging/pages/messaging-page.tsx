import { MessageSquarePlus, MessagesSquare } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { ConversationHeader } from '../components/conversation-header'
import { ConversationList } from '../components/conversation-list'
import { MessageComposer } from '../components/message-composer'
import { MessageThread } from '../components/message-thread'
import { NewConversation } from '../components/new-conversation'
import { useConversations } from '../hooks/use-messaging'

interface MessagingPageProps {
  /** Conversation selectionnee a l'ouverture (lien depuis un match FitMatch). */
  initialConversationId?: string
}

export function MessagingPage({ initialConversationId }: MessagingPageProps = {}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null)
  const [newOpen, setNewOpen] = useState(false)

  return (
    <>
      <PageHeader title="Messages" description="Échangez avec votre coach ou vos athlètes." />

      <div className="grid h-[calc(100dvh-16rem)] min-h-[32rem] overflow-hidden rounded-2xl border bg-card shadow-soft md:grid-cols-[22rem_1fr]">
        <aside className={cn('min-h-0 flex-col border-r', selectedId ? 'hidden md:flex' : 'flex')}>
          <div className="flex items-center justify-between gap-2 p-4 pb-3">
            <h2 className="text-lg font-semibold tracking-tight">Conversations</h2>
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={() => setNewOpen(true)}
            >
              <MessageSquarePlus /> Nouvelle
            </Button>
          </div>
          <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        <section className={cn('min-h-0 min-w-0 flex-col', selectedId ? 'flex' : 'hidden md:flex')}>
          {selectedId ? (
            <ConversationPanel conversationId={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <ThreadPlaceholder />
          )}
        </section>
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Choisissez la personne avec qui vous voulez échanger.
            </DialogDescription>
          </DialogHeader>
          <NewConversation
            onStarted={(id) => {
              setSelectedId(id)
              setNewOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

function ConversationPanel({
  conversationId,
  onBack,
}: {
  conversationId: string
  onBack: () => void
}) {
  const { data: conversations } = useConversations()
  const conversation = conversations?.find((c) => c.id === conversationId)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ConversationHeader name={conversation?.counterpartName ?? 'Conversation'} onBack={onBack} />
      <MessageThread conversationId={conversationId} />
      <MessageComposer key={conversationId} conversationId={conversationId} />
    </div>
  )
}

function ThreadPlaceholder() {
  return (
    <div className="grid flex-1 place-items-center p-8 text-center">
      <div className="space-y-4">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 animate-pulse rounded-3xl bg-primary/25 blur-2xl" />
          <span className="relative grid size-20 animate-float-chip place-items-center rounded-3xl bg-brand text-white shadow-xl shadow-primary/30">
            <MessagesSquare className="size-9" />
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Sélectionnez une conversation</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Choisissez un échange dans la liste, ou démarrez-en un nouveau avec le bouton Nouvelle.
          </p>
        </div>
      </div>
    </div>
  )
}

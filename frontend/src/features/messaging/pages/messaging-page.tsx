import { MessagesSquare } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { ConversationList } from '../components/conversation-list'
import { MessageComposer } from '../components/message-composer'
import { MessageThread } from '../components/message-thread'
import { NewConversation } from '../components/new-conversation'
import { useConversations } from '../hooks/use-messaging'

export function MessagingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <PageHeader title="Messages" description="Échangez avec votre coach ou vos athlètes." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NewConversation onStarted={setSelectedId} />
            <Separator />
            <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          {selectedId ? (
            <ConversationPanel conversationId={selectedId} />
          ) : (
            <EmptyState icon={MessagesSquare} title="Sélectionnez une conversation" />
          )}
        </div>
      </div>
    </>
  )
}

function ConversationPanel({ conversationId }: { conversationId: string }) {
  const { data: conversations } = useConversations()
  const conversation = conversations?.find((c) => c.id === conversationId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{conversation?.counterpartName ?? 'Conversation'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageThread conversationId={conversationId} />
        <MessageComposer key={conversationId} conversationId={conversationId} />
      </CardContent>
    </Card>
  )
}

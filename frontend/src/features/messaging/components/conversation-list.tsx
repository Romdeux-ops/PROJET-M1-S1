import { Loader2, MessagesSquare, Search } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSession } from '@/lib/auth/session'
import { cn, initials } from '@/lib/utils'

import { useConversations } from '../hooks/use-messaging'
import type { Conversation } from '../schemas'
import { listTimestamp } from '../thread-model'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (conversationId: string) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations = [], isLoading } = useConversations()
  const userId = useSession((s) => s.user?.id)
  const [query, setQuery] = useState('')

  if (isLoading) return <Loader2 className="m-4 size-5 animate-spin text-muted-foreground" />
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Aucune conversation"
        description="Démarrez-en une avec le bouton Nouvelle."
        className="m-3 border-0 py-10"
      />
    )
  }

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? conversations.filter((c) => c.counterpartName.toLowerCase().includes(needle))
    : conversations

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative px-3 pb-2">
        <Search className="pointer-events-none absolute top-2.5 left-6 size-4 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Rechercher une conversation"
          placeholder="Rechercher…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 rounded-full pl-9"
        />
      </div>
      {visible.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Aucun résultat pour « {query} ».
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {visible.map((conversation) => (
            <li key={conversation.id}>
              <ConversationItem
                conversation={conversation}
                selected={conversation.id === selectedId}
                mine={conversation.lastMessageSenderId === userId}
                onSelect={() => onSelect(conversation.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ConversationItem({
  conversation,
  selected,
  mine,
  onSelect,
}: {
  conversation: Conversation
  selected: boolean
  mine: boolean
  onSelect: () => void
}) {
  const unread = conversation.unreadCount > 0
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-accent/70',
        selected && 'bg-accent shadow-sm',
      )}
    >
      {selected && (
        <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary" />
      )}
      <Avatar size="lg">
        <AvatarFallback className="bg-brand text-sm font-semibold text-white">
          {initials(conversation.counterpartName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn('truncate text-sm', unread ? 'font-bold' : 'font-medium')}>
            {conversation.counterpartName}
          </p>
          {conversation.lastMessageAt && (
            <span
              className={cn(
                'shrink-0 text-xs',
                unread ? 'font-semibold text-primary' : 'text-muted-foreground',
              )}
            >
              {listTimestamp(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'truncate text-xs',
              unread ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {conversation.lastMessagePreview
              ? `${mine ? 'Vous : ' : ''}${conversation.lastMessagePreview}`
              : 'Aucun message'}
          </p>
          {unread && (
            <Badge
              aria-label={`${conversation.unreadCount} non lu(s)`}
              className="h-5 min-w-5 animate-pulse-ring justify-center rounded-full px-1.5"
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}

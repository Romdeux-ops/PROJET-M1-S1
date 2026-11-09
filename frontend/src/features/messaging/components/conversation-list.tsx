import { Loader2, MessagesSquare } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/lib/auth/session'
import { formatShortDate, formatTime } from '@/lib/format'
import { cn, initials } from '@/lib/utils'

import { useConversations } from '../hooks/use-messaging'
import type { Conversation } from '../schemas'

interface ConversationListProps {
  selectedId: string | null
  onSelect: (conversationId: string) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations = [], isLoading } = useConversations()
  const userId = useSession((s) => s.user?.id)

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Aucune conversation"
        description="Démarrez-en une ci-dessus."
      />
    )
  }

  return (
    <ul className="space-y-1">
      {conversations.map((conversation) => (
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
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent',
        selected && 'bg-accent',
      )}
    >
      <Avatar size="sm">
        <AvatarFallback className="bg-brand text-xs font-semibold text-white">
          {initials(conversation.counterpartName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
            {conversation.counterpartName}
          </p>
          {conversation.lastMessageAt && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatShortDate(conversation.lastMessageAt)} {formatTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {conversation.lastMessagePreview
              ? `${mine ? 'Vous : ' : ''}${conversation.lastMessagePreview}`
              : 'Aucun message'}
          </p>
          {unread && (
            <Badge aria-label={`${conversation.unreadCount} non lu(s)`}>
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}

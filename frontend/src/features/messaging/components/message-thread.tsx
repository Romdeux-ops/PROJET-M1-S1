import { CheckCheck, Loader2, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/session'
import { formatShortDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useMarkRead, useMessages } from '../hooks/use-messaging'
import type { Message } from '../schemas'

/** Fil d'une conversation, du plus ancien (en haut) au plus recent (en bas). */
export function MessageThread({ conversationId }: { conversationId: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMessages(conversationId)
  const { mutate: markRead } = useMarkRead()
  const userId = useSession((s) => s.user?.id)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Les pages arrivent du plus recent au plus ancien : on les remet dans l'ordre de lecture.
  const messages = useMemo(
    () => (data?.pages.flatMap((page) => page.items) ?? []).toReversed(),
    [data],
  )
  const newestId = messages.at(-1)?.id
  const latestIncoming = messages.findLast((m) => m.senderId !== userId)
  const latestIncomingId = latestIncoming?.id
  const latestIncomingReadAt = latestIncoming?.readAt

  useEffect(() => {
    if (latestIncomingId && latestIncomingReadAt == null) markRead(conversationId)
  }, [latestIncomingId, latestIncomingReadAt, conversationId, markRead])

  useEffect(() => {
    const container = scrollRef.current
    if (newestId && container) container.scrollTop = container.scrollHeight
  }, [newestId])

  if (isLoading) return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  if (messages.length === 0) {
    return <EmptyState icon={MessageCircle} title="Aucun message" description="Lancez la discussion." />
  }

  const lastMine = messages.findLast((m) => m.senderId === userId)

  return (
    <div ref={scrollRef} className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage && <Loader2 className="animate-spin" />}
            Messages précédents
          </Button>
        </div>
      )}
      <ul className="space-y-2">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            mine={message.senderId === userId}
            showRead={message.id === lastMine?.id && message.readAt !== null}
          />
        ))}
      </ul>
    </div>
  )
}

function MessageBubble({
  message,
  mine,
  showRead,
}: {
  message: Message
  mine: boolean
  showRead: boolean
}) {
  return (
    <li className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
      <p
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap',
          mine ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message.body}
      </p>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {formatShortDate(message.sentAt)} {formatTime(message.sentAt)}
        {showRead && (
          <>
            <CheckCheck className="size-3.5" aria-hidden />
            Lu
          </>
        )}
      </span>
    </li>
  )
}

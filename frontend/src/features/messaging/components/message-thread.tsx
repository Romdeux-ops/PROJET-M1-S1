import { ArrowDown, CheckCheck, Loader2, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth/session'
import { formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useMarkRead, useMessages } from '../hooks/use-messaging'
import type { Message } from '../schemas'
import { buildThreadRows, dayLabel } from '../thread-model'

/** Distance (px) du bas en dessous de laquelle on considere que l'utilisateur lit les derniers messages. */
const NEAR_BOTTOM = 120

/** Fil d'une conversation, du plus ancien (en haut) au plus recent (en bas). */
export function MessageThread({ conversationId }: { conversationId: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMessages(conversationId)
  const { mutate: markRead } = useMarkRead()
  const userId = useSession((s) => s.user?.id)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const atBottomRef = useRef(true)

  // Les pages arrivent du plus recent au plus ancien : on les remet dans l'ordre de lecture.
  const messages = useMemo(
    () => (data?.pages.flatMap((page) => page.items) ?? []).toReversed(),
    [data],
  )
  const rows = useMemo(() => buildThreadRows(messages, userId), [messages, userId])
  const newestId = messages.at(-1)?.id
  const latestIncoming = messages.findLast((m) => m.senderId !== userId)
  const latestIncomingId = latestIncoming?.id
  const latestIncomingReadAt = latestIncoming?.readAt
  const lastMine = messages.findLast((m) => m.senderId === userId)

  useEffect(() => {
    if (latestIncomingId && latestIncomingReadAt == null) markRead(conversationId)
  }, [latestIncomingId, latestIncomingReadAt, conversationId, markRead])

  // Un nouveau message fait descendre le fil, sauf si l'utilisateur relit plus haut.
  useEffect(() => {
    const container = scrollRef.current
    if (newestId && container && atBottomRef.current) container.scrollTop = container.scrollHeight
  }, [newestId])

  function scrollToBottom() {
    const container = scrollRef.current
    if (!container) return
    if (container.scrollTo) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    else container.scrollTop = container.scrollHeight
  }

  if (isLoading) {
    return (
      <div className="grid flex-1 place-items-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (messages.length === 0) {
    return (
      <div className="grid flex-1 place-items-center p-6">
        <EmptyState
          icon={MessageCircle}
          title="Aucun message"
          description="Lancez la discussion."
          className="border-0"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM
          atBottomRef.current = near
          setAtBottom(near)
        }}
        className="h-full overflow-y-auto px-4 py-4"
      >
        {hasNextPage && (
          <div className="mb-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage && <Loader2 className="animate-spin" />}
              Messages précédents
            </Button>
          </div>
        )}
        <ul>
          {rows.map((row) =>
            row.type === 'day' ? (
              <li key={row.key} className="my-4 flex justify-center first:mt-0">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {dayLabel(row.date)}
                </span>
              </li>
            ) : (
              <MessageBubble
                key={row.key}
                message={row.message}
                mine={row.mine}
                first={row.first}
                last={row.last}
                showRead={row.message.id === lastMine?.id && row.message.readAt !== null}
              />
            ),
          )}
        </ul>
      </div>

      {!atBottom && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="Aller au dernier message"
          className="absolute right-4 bottom-3 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ArrowDown />
        </Button>
      )}
    </div>
  )
}

function MessageBubble({
  message,
  mine,
  first,
  last,
  showRead,
}: {
  message: Message
  mine: boolean
  first: boolean
  last: boolean
  showRead: boolean
}) {
  return (
    <li
      className={cn(
        'flex flex-col',
        'motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
        mine ? 'items-end' : 'items-start',
        first ? 'mt-3 first:mt-0' : 'mt-0.5',
      )}
    >
      <p
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap shadow-sm',
          mine ? 'bg-brand text-white' : 'bg-muted',
          last && (mine ? 'rounded-br-md' : 'rounded-bl-md'),
          !first && (mine ? 'rounded-tr-md' : 'rounded-tl-md'),
        )}
      >
        {message.body}
      </p>
      {last && (
        <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          {formatTime(message.sentAt)}
          {showRead && (
            <>
              <CheckCheck className="size-3.5 text-primary" aria-hidden />
              Lu
            </>
          )}
        </span>
      )}
    </li>
  )
}

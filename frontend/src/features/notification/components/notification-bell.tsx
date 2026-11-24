import {
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CheckCheck,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '../hooks/use-notifications'
import { formatRelativeTime } from '../relative-time'
import type { AppNotification, NotificationType } from '../schemas'

const MAX_BADGE = 99

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  SESSION_REMINDER: CalendarClock,
  SESSION_PENDING_VALIDATION: CalendarCheck,
  SESSION_VALIDATED: CalendarCheck,
  BOOKING_CREATED: CalendarPlus,
  BOOKING_CANCELLED: CalendarX,
  BOOKING_REMINDER: CalendarClock,
  FOLLOW_REQUESTED: UserPlus,
  FOLLOW_ACCEPTED: UserCheck,
  FOLLOW_DECLINED: UserX,
}

function TypeIcon({ type }: { type: NotificationType }) {
  const Icon = TYPE_ICONS[type]
  return <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
}

interface NotificationBellProps {
  /** Ouvre la route frontend portee par une notification (fournie par le shell, seul a connaitre le routeur). */
  onNavigate?: (link: string) => void
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const { data: unread = 0 } = useUnreadCount()
  const { data: page, isPending } = useNotifications(open)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const notifications = page?.content ?? []

  function openNotification(notification: AppNotification) {
    if (!notification.readAt) markRead.mutate(notification.id)
    setOpen(false)
    if (notification.link) onNavigate?.(notification.link)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread > 0 ? `Notifications, ${unread} non lue(s)` : 'Notifications'}
        >
          <Bell />
          {unread > 0 && (
            <span
              data-testid="notification-badge"
              className="text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold"
            >
              {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck />
            Tout marquer lu
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Chargement…</p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Aucune notification.
            </p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={cn(
                      'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60',
                      !notification.readAt && 'bg-primary/5',
                    )}
                  >
                    <TypeIcon type={notification.type} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            'truncate text-sm',
                            !notification.readAt && 'font-semibold',
                          )}
                        >
                          {notification.title}
                        </span>
                        {!notification.readAt && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-primary"
                            aria-label="Non lue"
                          />
                        )}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {notification.body}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

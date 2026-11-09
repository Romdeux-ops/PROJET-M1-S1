import { Loader2, MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type SessionUser, useHasRole } from '@/lib/auth/session'

import { useMyAthletes, useMyCoaches } from '@/features/coaching'

import { useStartConversation } from '../hooks/use-messaging'

interface NewConversationProps {
  onStarted: (conversationId: string) => void
}

/** Ouvre (ou retrouve) la conversation avec un athlete suivi, ou avec un coach. */
export function NewConversation(props: NewConversationProps) {
  return useHasRole('COACH') ? <AthletePicker {...props} /> : <CoachPicker {...props} />
}

function AthletePicker(props: NewConversationProps) {
  const { data = [] } = useMyAthletes()
  return (
    <CounterpartPicker
      {...props}
      counterparts={data}
      label="Athlète"
      placeholder="Choisir un athlète"
      emptyHint="Rattachez un athlète pour pouvoir lui écrire."
    />
  )
}

function CoachPicker(props: NewConversationProps) {
  const { data = [] } = useMyCoaches()
  return (
    <CounterpartPicker
      {...props}
      counterparts={data}
      label="Coach"
      placeholder="Choisir un coach"
      emptyHint="Votre coach doit vous rattacher pour pouvoir lui écrire."
    />
  )
}

function CounterpartPicker({
  onStarted,
  counterparts,
  label,
  placeholder,
  emptyHint,
}: NewConversationProps & {
  counterparts: SessionUser[]
  label: string
  placeholder: string
  emptyHint: string
}) {
  const start = useStartConversation()
  const [counterpartId, setCounterpartId] = useState('')

  if (counterparts.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyHint}</p>
  }

  return (
    <div className="flex gap-2">
      <Select value={counterpartId} onValueChange={setCounterpartId}>
        <SelectTrigger className="flex-1" aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {counterparts.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        disabled={!counterpartId || start.isPending}
        onClick={() =>
          start.mutate(counterpartId, { onSuccess: (conversation) => onStarted(conversation.id) })
        }
      >
        {start.isPending ? <Loader2 className="animate-spin" /> : <MessageSquarePlus />}
        Écrire
      </Button>
    </div>
  )
}

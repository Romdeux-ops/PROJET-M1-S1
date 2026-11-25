import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, SendHorizontal } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { useSendMessage } from '../hooks/use-messaging'
import { MESSAGE_MAX_LENGTH, type MessageFormInput, messageFormSchema } from '../schemas'

/** Le compteur n'apparait que lorsque la limite approche. */
const COUNTER_FROM = MESSAGE_MAX_LENGTH - 200

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const send = useSendMessage(conversationId)
  const form = useForm<MessageFormInput>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { body: '' },
  })
  const body = useWatch({ control: form.control, name: 'body' })
  const length = body?.length ?? 0

  const onSubmit = form.handleSubmit((values) => {
    send.mutate(values.body, {
      onSuccess: () => form.reset(),
      onError: (error) => form.setError('root', { message: error.message }),
    })
  })

  const error = form.formState.errors.root?.message ?? form.formState.errors.body?.message

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-1.5 border-t bg-card/60 p-3">
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    aria-label="Message"
                    placeholder="Écrire un message…"
                    maxLength={MESSAGE_MAX_LENGTH}
                    className="max-h-40 min-h-10 resize-none rounded-2xl px-4 py-2.5"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        void onSubmit()
                      }
                    }}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Envoyer"
            className="size-10 shrink-0 rounded-full transition-transform active:scale-90"
            disabled={send.isPending || length === 0}
          >
            {send.isPending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3 px-2 text-xs">
          <p className="hidden text-muted-foreground sm:block">
            Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne
          </p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          {length >= COUNTER_FROM && (
            <span
              className={cn(
                'ml-auto tabular-nums',
                length >= MESSAGE_MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {length} / {MESSAGE_MAX_LENGTH}
            </span>
          )}
        </div>
      </form>
    </Form>
  )
}

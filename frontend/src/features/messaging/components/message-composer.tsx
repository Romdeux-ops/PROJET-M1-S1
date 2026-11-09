import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, SendHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import { useSendMessage } from '../hooks/use-messaging'
import { MESSAGE_MAX_LENGTH, type MessageFormInput, messageFormSchema } from '../schemas'

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const send = useSendMessage(conversationId)
  const form = useForm<MessageFormInput>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { body: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    send.mutate(values.body, {
      onSuccess: () => form.reset(),
      onError: (error) => form.setError('root', { message: error.message }),
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    aria-label="Message"
                    placeholder="Écrire un message… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"
                    maxLength={MESSAGE_MAX_LENGTH}
                    className="max-h-40"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        void onSubmit()
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="icon" aria-label="Envoyer" disabled={send.isPending}>
            {send.isPending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
          </Button>
        </div>
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}
      </form>
    </Form>
  )
}

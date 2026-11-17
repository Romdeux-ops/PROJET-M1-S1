import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useInviteAthlete } from '../hooks/use-coaching'
import { type InviteAthleteInput, inviteAthleteSchema } from '../schemas'

export function InviteAthleteForm() {
  const invite = useInviteAthlete()
  const form = useForm<InviteAthleteInput>({
    resolver: zodResolver(inviteAthleteSchema),
    defaultValues: { athleteEmail: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    invite.mutate(values, {
      onSuccess: () => form.reset(),
      onError: (error) => form.setError('athleteEmail', { message: error.message }),
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="athleteEmail"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input type="email" placeholder="email@athlete.fr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={invite.isPending}>
          {invite.isPending ? <Loader2 className="animate-spin" /> : <Send />}
          Inviter
        </Button>
      </form>
    </Form>
  )
}

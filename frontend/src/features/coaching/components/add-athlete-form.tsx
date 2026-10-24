import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useAddAthlete } from '../hooks/use-coaching'
import { type AddAthleteInput, addAthleteSchema } from '../schemas'

export function AddAthleteForm() {
  const addAthlete = useAddAthlete()
  const form = useForm<AddAthleteInput>({
    resolver: zodResolver(addAthleteSchema),
    defaultValues: { athleteEmail: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    addAthlete.mutate(values, {
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
        <Button type="submit" disabled={addAthlete.isPending}>
          {addAthlete.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Rattacher
        </Button>
      </form>
    </Form>
  )
}

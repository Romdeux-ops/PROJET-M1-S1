import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useSchedule } from '../hooks/use-planning'
import { type ScheduleFormInput, scheduleFormSchema } from '../schemas'

export function ScheduleForm({ defaultDate, onDone }: { defaultDate: string; onDone: () => void }) {
  const schedule = useSchedule()
  const form = useForm<ScheduleFormInput>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { title: '', scheduledDate: defaultDate, notes: '' },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => schedule.mutate(values, { onSuccess: onDone }))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Séance jambes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={schedule.isPending}>
          {schedule.isPending && <Loader2 className="animate-spin" />}
          Planifier
        </Button>
      </form>
    </Form>
  )
}

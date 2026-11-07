import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDuration, isoInDays } from '@/lib/format'

import { useCreateSlot } from '../hooks/use-booking'
import { SLOT_DURATIONS, type SlotFormInput, slotFormSchema } from '../schemas'

export function SlotForm() {
  const createSlot = useCreateSlot()
  const form = useForm<SlotFormInput>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: { date: isoInDays(1), startTime: '18:00', durationMinutes: '60' },
  })

  const onSubmit = form.handleSubmit((values) => {
    createSlot.mutate(values, {
      onError: (error) => form.setError('root', { message: error.message }),
    })
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" min={isoInDays(0)} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Début</FormLabel>
                <FormControl>
                  <Input type="time" step={900} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SLOT_DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {formatDuration(Number(d))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}
        <Button type="submit" disabled={createSlot.isPending}>
          {createSlot.isPending ? <Loader2 className="animate-spin" /> : <CalendarPlus />}
          Publier le créneau
        </Button>
      </form>
    </Form>
  )
}

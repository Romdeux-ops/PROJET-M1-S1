import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea'
import { type Program, useCoachPrograms, usePrograms } from '@/features/program'

import { useSchedule } from '../hooks/use-planning'
import { type ScheduleFormInput, scheduleFormSchema } from '../schemas'

/** Radix Select n'accepte pas la valeur vide : sentinelle pour « aucun ». */
const NONE = '__none__'

/** Programmes utilisables : les siens et les publics, plus ceux des coachs actifs. */
function useUsablePrograms(): Program[] {
  const visible = usePrograms({})
  const fromCoaches = useCoachPrograms({})
  return useMemo(() => {
    const byId = new Map<string, Program>()
    for (const program of [...(visible.data ?? []), ...(fromCoaches.data ?? [])]) {
      byId.set(program.id, program)
    }
    return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
  }, [visible.data, fromCoaches.data])
}

export function ScheduleForm({ defaultDate, onDone }: { defaultDate: string; onDone: () => void }) {
  const schedule = useSchedule()
  const programs = useUsablePrograms()
  const form = useForm<ScheduleFormInput>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: '',
      scheduledDate: defaultDate,
      programId: '',
      programDayId: '',
      notes: '',
    },
  })
  const programId = useWatch({ control: form.control, name: 'programId' })
  const selectedProgram = programs.find((p) => p.id === programId)

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
          name="programId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programme</FormLabel>
              <Select
                value={field.value || NONE}
                onValueChange={(value) => {
                  field.onChange(value === NONE ? '' : value)
                  form.setValue('programDayId', '')
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Aucun programme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE}>Aucun programme (séance libre)</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Vos programmes, les programmes publics et ceux de vos coachs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedProgram && selectedProgram.days.length > 0 && (
          <FormField
            control={form.control}
            name="programDayId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jour du programme</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={(value) => {
                    field.onChange(value === NONE ? '' : value)
                    const day = selectedProgram.days.find((d) => d.id === value)
                    if (day && !form.getValues('title').trim()) {
                      form.setValue('title', `${selectedProgram.title} – ${day.name}`)
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tout le programme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Pas de jour précis</SelectItem>
                    {selectedProgram.days.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                        {d.restDay ? ' (repos)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { type ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { todayIso } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useCreateSession } from '../hooks/use-sessions'
import {
  type CreateSessionInput,
  createSessionSchema,
  SESSION_TYPE_LABELS,
  SESSION_TYPES,
} from '../schemas'
import { SESSION_TYPE_STYLES } from './session-type-styles'

const defaultValues = (): CreateSessionInput => ({
  title: '',
  type: 'STRENGTH',
  date: todayIso(),
  durationMinutes: 60,
  perceivedEffort: 7,
  notes: '',
})

export function CreateSessionDialog({ trigger }: { trigger?: ReactElement }) {
  const [open, setOpen] = useState(false)
  const createSession = useCreateSession()
  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: defaultValues(),
  })

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) form.reset(defaultValues())
  }

  const onSubmit = form.handleSubmit((values) =>
    createSession.mutate(values, { onSuccess: () => onOpenChange(false) }),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus /> Nouvelle séance
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle séance</DialogTitle>
          <DialogDescription>Enregistrez une séance réalisée dans votre carnet.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intitulé</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex. Push day, Fractionné 10x400…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div role="radiogroup" aria-label="Type" className="grid grid-cols-4 gap-2">
                    {SESSION_TYPES.map((type) => {
                      const { icon: Icon } = SESSION_TYPE_STYLES[type]
                      const selected = field.value === type
                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => field.onChange(type)}
                          className={cn(
                            'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
                            'outline-none hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                            selected &&
                              'border-primary bg-primary/5 text-primary ring-2 ring-primary/20',
                          )}
                        >
                          <Icon className="size-4" />
                          {SESSION_TYPE_LABELS[type]}
                        </button>
                      )
                    })}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" max={todayIso()} {...field} />
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
                    <FormLabel>Durée (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={5}
                        step={5}
                        {...field}
                        value={Number.isNaN(field.value) ? '' : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="perceivedEffort"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Effort ressenti</FormLabel>
                    <span className="text-sm font-semibold text-primary tabular-nums">
                      {field.value}/10
                    </span>
                  </div>
                  <FormControl>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      className="w-full accent-primary"
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
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
                    <Textarea rows={3} placeholder="Sensations, records, douleurs…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createSession.isPending}>
                {createSession.isPending && <Loader2 className="animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

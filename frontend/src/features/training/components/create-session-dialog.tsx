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

import { useCreateSession } from '../hooks/use-sessions'
import { type CreateSessionInput, createSessionSchema } from '../schemas'

function nowLocal() {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const defaultValues = (): CreateSessionInput => ({
  title: '',
  performedAt: nowLocal(),
  durationMinutes: 60,
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="performedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date et heure</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                        min={0}
                        step={5}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? e.target.valueAsNumber : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

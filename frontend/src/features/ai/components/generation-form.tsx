import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Sparkles } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { LEVEL_LABELS, programLevels } from '@/features/program'

import {
  GOAL_LABELS,
  type GenerationFormInput,
  generationFormSchema,
  generationGoals,
} from '../schemas'

const SESSION_COUNTS = [1, 2, 3, 4, 5, 6, 7]

export function GenerationForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: GenerationFormInput) => void
  isPending: boolean
}) {
  const form = useForm<GenerationFormInput>({
    resolver: zodResolver(generationFormSchema),
    defaultValues: {
      goal: 'MUSCLE_GAIN',
      level: 'BEGINNER',
      sessionsPerWeek: 3,
      equipment: '',
      constraints: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objectif</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {generationGoals.map((g) => (
                    <SelectItem key={g} value={g}>
                      {GOAL_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programLevels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {LEVEL_LABELS[l]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sessionsPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Séances par semaine</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SESSION_COUNTS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matériel disponible</FormLabel>
              <FormControl>
                <Input placeholder="Haltères, barre, banc, poids du corps…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="constraints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraintes (facultatif)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Douleur au genou, 45 minutes maximum par séance…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Générer un programme
        </Button>
      </form>
    </Form>
  )
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useHasRole } from '@/lib/auth/session'

import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  VISIBILITY_LABELS,
  type Program,
  type ProgramFormInput,
  programCategories,
  programFormSchema,
  programLevels,
  programVisibilities,
} from '../schemas'

export function ProgramForm({
  program,
  onSubmit,
  isPending,
}: {
  program?: Program
  onSubmit: (values: ProgramFormInput) => void
  isPending: boolean
}) {
  const canShareWithClients = useHasRole('COACH', 'ADMIN')
  const visibilityOptions = programVisibilities.filter(
    (v) => v !== 'CLIENTS' || canShareWithClients,
  )
  const form = useForm<ProgramFormInput>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      title: program?.title ?? '',
      description: program?.description ?? '',
      category: program?.category ?? 'STRENGTH',
      level: program?.level ?? 'BEGINNER',
      visibility: program?.visibility ?? 'PRIVATE',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Prise de masse 8 semaines" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Objectif, public visé, organisation des semaines..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
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
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibilité</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {visibilityOptions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {VISIBILITY_LABELS[v]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {program ? 'Enregistrer' : 'Créer le programme'}
        </Button>
      </form>
    </Form>
  )
}

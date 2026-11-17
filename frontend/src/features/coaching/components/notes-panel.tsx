import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, NotebookPen, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'

import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '../hooks/use-coaching'
import { type CoachNote, type NoteFormInput, noteFormSchema } from '../schemas'

/** Notes privées du coach sur un athlète : l'athlète ne les voit jamais. */
export function NotesPanel({ athleteId }: { athleteId: string }) {
  const { data: notes = [], isLoading } = useNotes(athleteId)
  const createNote = useCreateNote(athleteId)
  const deleteNote = useDeleteNote(athleteId)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <NotebookPen className="size-4" /> Notes privées
        </CardTitle>
        <CardDescription>Visibles de vous seul, jamais de l'athlète.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoteForm
          placeholder="Blessure, objectif, ressenti, points à travailler…"
          submitLabel="Ajouter la note"
          isPending={createNote.isPending}
          onSubmit={(values, reset) => createNote.mutate(values, { onSuccess: reset })}
        />

        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) =>
              editingId === note.id ? (
                <li key={note.id}>
                  <EditNote athleteId={athleteId} note={note} onDone={() => setEditingId(null)} />
                </li>
              ) : (
                <li key={note.id} className="space-y-1.5 rounded-md border p-3 text-sm">
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                      {note.updatedAt !== note.createdAt && ' · modifiée'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(note.id)}
                      >
                        <Pencil className="size-3.5" /> Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleteNote.isPending}
                        onClick={() => deleteNote.mutate(note.id)}
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </Button>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function EditNote({
  athleteId,
  note,
  onDone,
}: {
  athleteId: string
  note: CoachNote
  onDone: () => void
}) {
  const updateNote = useUpdateNote(athleteId)
  return (
    <div className="space-y-2 rounded-md border p-3">
      <NoteForm
        defaultContent={note.content}
        submitLabel="Enregistrer"
        isPending={updateNote.isPending}
        onCancel={onDone}
        onSubmit={(values) =>
          updateNote.mutate({ noteId: note.id, ...values }, { onSuccess: onDone })
        }
      />
    </div>
  )
}

interface NoteFormProps {
  defaultContent?: string
  placeholder?: string
  submitLabel: string
  isPending: boolean
  onCancel?: () => void
  onSubmit: (values: NoteFormInput, reset: () => void) => void
}

function NoteForm({
  defaultContent = '',
  placeholder,
  submitLabel,
  isPending,
  onCancel,
  onSubmit,
}: NoteFormProps) {
  const form = useForm<NoteFormInput>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: { content: defaultContent },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values, () => form.reset()))}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea rows={3} placeholder={placeholder} aria-label="Note" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}

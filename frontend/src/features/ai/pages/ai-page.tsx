import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { GeneratedProgramPreview } from '../components/generated-program-preview'
import { GenerationForm } from '../components/generation-form'
import { useGenerateProgram, useSaveGeneratedProgram } from '../hooks/use-ai'
import type { GeneratedProgram, GenerationFormInput } from '../schemas'

export function AiPage({ onSaved }: { onSaved?: () => void }) {
  const [draft, setDraft] = useState<GeneratedProgram | null>(null)
  const [lastInput, setLastInput] = useState<GenerationFormInput | null>(null)
  const generate = useGenerateProgram()
  const save = useSaveGeneratedProgram()

  function handleGenerate(input: GenerationFormInput) {
    setLastInput(input)
    generate.mutate(input, { onSuccess: setDraft })
  }

  function handleSave() {
    if (draft) save.mutate(draft, { onSuccess: () => onSaved?.() })
  }

  return (
    <>
      <PageHeader
        title="Génération par IA"
        description="Décrivez votre objectif : un programme est composé à partir du catalogue d’exercices. Rien n’est enregistré sans votre accord."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Votre demande</CardTitle>
            <CardDescription>Objectif, niveau, rythme et matériel.</CardDescription>
          </CardHeader>
          <CardContent>
            <GenerationForm onSubmit={handleGenerate} isPending={generate.isPending} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programme proposé</CardTitle>
          </CardHeader>
          <CardContent>
            {generate.isPending ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Génération en cours...
              </p>
            ) : draft ? (
              <GeneratedProgramPreview
                draft={draft}
                onRegenerate={() => lastInput && handleGenerate(lastInput)}
                onSave={handleSave}
                isRegenerating={generate.isPending}
                isSaving={save.isPending}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Le programme proposé apparaîtra ici.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

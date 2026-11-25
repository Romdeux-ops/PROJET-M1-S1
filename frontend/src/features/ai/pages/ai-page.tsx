import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { GeneratedProgramPreview } from '../components/generated-program-preview'
import { GeneratingState } from '../components/generating-state'
import { GenerationForm } from '../components/generation-form'
import { useGenerateProgram, useSaveGeneratedProgram } from '../hooks/use-ai'
import type { GeneratedProgram, GenerationFormInput } from '../schemas'

export function AiPage({ onSaved }: { onSaved?: () => void }) {
  const [draft, setDraft] = useState<GeneratedProgram | null>(null)
  const [lastInput, setLastInput] = useState<GenerationFormInput | null>(null)
  const [variant, setVariant] = useState(0)
  const generate = useGenerateProgram()
  const save = useSaveGeneratedProgram()

  function runGeneration(input: GenerationFormInput, nextVariant: number) {
    setLastInput(input)
    setVariant(nextVariant)
    generate.mutate({ input, variant: nextVariant }, { onSuccess: setDraft })
  }

  /** Une nouvelle demande repart de la variante 0 ; « Régénérer » passe à la suivante. */
  const handleGenerate = (input: GenerationFormInput) => runGeneration(input, 0)
  const handleRegenerate = () => {
    if (lastInput) runGeneration(lastInput, variant + 1)
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
              <GeneratingState />
            ) : draft ? (
              <GeneratedProgramPreview
                draft={draft}
                onRegenerate={handleRegenerate}
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

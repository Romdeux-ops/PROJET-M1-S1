import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { useSaveMatchProfile } from '../hooks/use-matching'
import {
  GOAL_LABELS,
  GOALS,
  LEVEL_LABELS,
  LEVELS,
  type MatchProfileFormInput,
  type MatchProfileFormValues,
  matchProfileFormSchema,
  type MyMatchProfile,
  SLOT_LABELS,
  SLOTS,
  SPORT_LABELS,
  SPORTS,
  TRAINING_MODE_LABELS,
  TRAINING_MODES,
} from '../schemas'
import { ChipGroup } from './chip-group'

const STEPS = [
  {
    title: 'Toi',
    fields: ['birthDate', 'heightCm', 'headline', 'about'],
  },
  {
    title: 'Ton sport',
    fields: ['sports', 'goals', 'levels', 'availability'],
  },
  {
    title: 'Tes rencontres',
    fields: ['trainingMode', 'city', 'maxBudgetEur', 'sessionRateEur', 'visible'],
  },
] as const satisfies { title: string; fields: (keyof MatchProfileFormInput)[] }[]

interface MatchProfileFormProps {
  me: MyMatchProfile
  onSaved?: () => void
}

/**
 * Inscription FitMatch en trois etapes. Prenom, objectif et niveau viennent du
 * compte ; date de naissance et taille sont pre-remplies quand elles sont
 * connues, et demandees sinon.
 */
export function MatchProfileForm({ me, onSaved }: MatchProfileFormProps) {
  const [step, setStep] = useState(0)
  const save = useSaveMatchProfile()
  const isCoach = me.side === 'COACH'
  const editing = me.profile !== null

  const form = useForm<MatchProfileFormInput, unknown, MatchProfileFormValues>({
    resolver: zodResolver(matchProfileFormSchema),
    defaultValues: {
      birthDate: me.birthDate ?? '',
      heightCm: me.heightCm ?? '',
      headline: me.profile?.headline ?? '',
      about: me.profile?.about ?? '',
      sports: me.profile?.sports ?? [],
      goals: me.profile?.goals ?? [],
      levels: me.profile?.levels ?? [],
      availability: me.profile?.availability ?? [],
      trainingMode: me.profile?.trainingMode ?? 'BOTH',
      city: me.profile?.city ?? '',
      maxBudgetEur: me.profile?.maxBudgetEur ?? '',
      sessionRateEur: me.profile?.sessionRateEur ?? '',
      visible: me.profile?.visible ?? true,
    },
  })

  const isLast = step === STEPS.length - 1
  const next = async () => {
    const fields = STEPS[step]?.fields ?? []
    if (await form.trigger([...fields])) setStep((s) => s + 1)
  }
  const onSubmit = form.handleSubmit((values) =>
    save.mutate(values, { onSuccess: () => onSaved?.() }),
  )

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          // "Entree" dans un champ avance d'une etape au lieu d'envoyer le formulaire trop tot.
          if (!isLast) {
            e.preventDefault()
            void next()
            return
          }
          void onSubmit(e)
        }}
        className="space-y-6"
        noValidate
      >
        <Stepper step={step} />

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fitmatch-first-name">Prénom</Label>
                <div className="relative">
                  <Input id="fitmatch-first-name" value={me.firstName} readOnly disabled />
                  <Lock className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Repris de votre compte.</p>
              </div>
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Date de naissance
                      {me.missing.includes('BIRTH_DATE') && (
                        <Badge variant="secondary">À compléter</Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Seul votre âge est affiché.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heightCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Taille (cm)
                      {me.missing.includes('HEIGHT') && <Badge variant="outline">Facultatif</Badge>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={(field.value as string | number | undefined) ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ton accroche</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isCoach
                          ? 'Coach running, je prépare ton premier semi'
                          : 'Je veux courir mon premier 10 km'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>À propos</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={
                        isCoach
                          ? 'Ton parcours, tes diplômes, ta façon de coacher…'
                          : 'Ton passé sportif, ce qui te motive, tes contraintes…'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="sports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isCoach ? 'Sports que tu coaches' : 'Sports que tu pratiques'}
                  </FormLabel>
                  <ChipGroup
                    label="Sports"
                    options={SPORTS}
                    labels={SPORT_LABELS}
                    value={field.value}
                    onChange={field.onChange}
                    max={8}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {isCoach ? (
              <>
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectifs que tu accompagnes</FormLabel>
                      <ChipGroup
                        label="Objectifs"
                        options={GOALS}
                        labels={GOAL_LABELS}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormDescription>Aucun choix : tous les objectifs.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="levels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveaux acceptés</FormLabel>
                      <ChipGroup
                        label="Niveaux"
                        options={LEVELS}
                        labels={LEVEL_LABELS}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormDescription>Aucun choix : tous les niveaux.</FormDescription>
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Objectif <strong className="text-foreground">{GOAL_LABELS[me.fitnessGoal]}</strong>,
                niveau{' '}
                <strong className="text-foreground">{LEVEL_LABELS[me.experienceLevel]}</strong> :
                repris de votre profil, modifiables dans « Mon profil ».
              </p>
            )}
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tes créneaux</FormLabel>
                  <ChipGroup
                    label="Créneaux"
                    options={SLOTS}
                    labels={SLOT_LABELS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="trainingMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format des séances</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRAINING_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {TRAINING_MODE_LABELS[mode]}
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={isCoach ? 'sessionRateEur' : 'maxBudgetEur'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isCoach ? 'Tarif par séance (€)' : 'Budget max par séance (€)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={(field.value as string | number | undefined) ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    {!isCoach && <FormDescription>Jamais montré aux coachs.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="visible"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <div>
                    <FormLabel>Profil visible</FormLabel>
                    <FormDescription>
                      Décochez pour faire une pause sans perdre vos matchs.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            className={cn(step === 0 && 'invisible')}
          >
            <ArrowLeft /> Retour
          </Button>
          {/*
            Cles distinctes : sans elles React reutiliserait le meme <button> et le
            clic sur "Suivant" de l'avant-derniere etape, devenu type="submit" avant
            la fin de l'evenement, enverrait le formulaire.
          */}
          {isLast ? (
            <Button key="submit" type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />}
              {editing ? 'Enregistrer' : 'Créer mon profil FitMatch'}
            </Button>
          ) : (
            <Button key="next" type="button" onClick={() => void next()}>
              Suivant <ArrowRight />
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Étapes de l'inscription">
      {STEPS.map((s, i) => (
        <li
          key={s.title}
          aria-current={i === step ? 'step' : undefined}
          className="flex flex-1 flex-col gap-1.5"
        >
          <span
            className={cn(
              'h-1.5 rounded-full transition-colors',
              i <= step ? 'bg-primary' : 'bg-muted',
            )}
          />
          <span
            className={cn(
              'text-xs font-medium',
              i === step ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {i + 1}. {s.title}
          </span>
        </li>
      ))}
    </ol>
  )
}

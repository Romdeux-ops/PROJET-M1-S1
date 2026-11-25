import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, Loader2, QrCode } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from '@/lib/auth/session'

import { usePublicSettings, useUpdatePublicSettings } from '../hooks/use-coaching'
import { type PublicProfileSettingsInput, publicProfileSettingsSchema } from '../schemas'
import { publicProfileUrl } from '../profile-url'
import { QrCodePanel } from './qr-code-panel'

/** Espace du coach : publier son profil, le decrire et recuperer le QR code a partager. */
export function PublicProfileCard() {
  const coachId = useSession((s) => s.user?.id)
  const { data: settings, isLoading } = usePublicSettings()
  const update = useUpdatePublicSettings()
  const form = useForm<PublicProfileSettingsInput>({
    resolver: zodResolver(publicProfileSettingsSchema),
    defaultValues: { enabled: false, headline: '', bio: '' },
  })

  useEffect(() => {
    if (settings) {
      form.reset({
        enabled: settings.enabled,
        headline: settings.headline ?? '',
        bio: settings.bio ?? '',
      })
    }
  }, [settings, form])

  const onSubmit = form.handleSubmit((values) => update.mutate(values))
  const published = settings?.enabled === true

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="size-5" /> Mon profil public
        </CardTitle>
        <CardDescription>
          Une page lisible sans compte, à partager par QR code. Les athlètes peuvent y demander à
          être suivis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Rendre mon profil public</FormLabel>
                      <FormDescription>
                        Désactivé : personne ne peut voir la page, même avec le lien.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Rendre mon profil public"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Préparateur physique · Musculation"
                        maxLength={120}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Présentation</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Votre parcours, votre approche, les objectifs que vous accompagnez…"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={update.isPending}>
                {update.isPending && <Loader2 className="animate-spin" />}
                Enregistrer
              </Button>
            </form>
          </Form>
        )}

        {published && coachId ? (
          <div className="space-y-4 border-t pt-6">
            <QrCodePanel url={publicProfileUrl(coachId)} fileName="fitcoach-profil-coach" />
            <div className="flex justify-center">
              <Button asChild variant="ghost" size="sm">
                <a href={`/coach/${coachId}`} target="_blank" rel="noreferrer">
                  <ExternalLink /> Voir ma page comme un visiteur
                </a>
              </Button>
            </div>
          </div>
        ) : (
          !isLoading && (
            <p className="border-t pt-4 text-sm text-muted-foreground">
              Le QR code apparaît dès que votre profil est public.
            </p>
          )
        )}
      </CardContent>
    </Card>
  )
}

import { Flame, Loader2, Settings2, Sparkles, Users } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { HeartDumbbell } from '@/components/heart-dumbbell-icon'
import { MatchDialog } from '../components/match-dialog'
import { MatchList } from '../components/match-list'
import { MatchProfileForm } from '../components/match-profile-form'
import { SwipeDeck } from '../components/swipe-deck'
import { useFeed, useMatches, useMatchProfile, useMessageMatch } from '../hooks/use-matching'
import type { Match, MyMatchProfile } from '../schemas'

interface MatchingPageProps {
  /** Appele avec l'identifiant de la conversation ouverte avec un match (la route navigue vers /messaging). */
  onOpenConversation?: (conversationId: string) => void
}

export function MatchingPage({ onOpenConversation }: MatchingPageProps) {
  const { data: me, isLoading } = useMatchProfile()

  return (
    <>
      <PageHeader
        title="FitMatch"
        description="Trouvez le coach ou l'athlète qui vous correspond : mêmes sports, mêmes créneaux, mêmes objectifs."
        actions={
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <HeartDumbbell className="size-5" />
          </span>
        }
      />
      {isLoading || !me ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Chargement" />
      ) : me.profile === null ? (
        <Onboarding me={me} />
      ) : (
        <MatchingHome me={me} onOpenConversation={onOpenConversation} />
      )}
    </>
  )
}

function Onboarding({ me }: { me: MyMatchProfile }) {
  const isCoach = me.side === 'COACH'
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="relative overflow-hidden lg:col-span-2">
        <div className="absolute inset-0 bg-brand opacity-90" />
        <CardContent className="relative flex h-full flex-col justify-between gap-8 text-white">
          <div className="space-y-3">
            <HeartDumbbell className="size-12" />
            <h2 className="text-2xl font-bold">
              {isCoach ? 'Rencontrez vos futurs athlètes' : 'Rencontrez votre coach idéal'}
            </h2>
            <p className="text-white/90">
              Créez votre profil en une minute, swipez, et discutez dès que l'intérêt est
              réciproque.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <Sparkles className="size-4 shrink-0" /> Un score de compatibilité basé sur le sport,
              pas sur la photo.
            </li>
            <li className="flex gap-2">
              <Users className="size-4 shrink-0" />
              {isCoach ? 'Vous ne voyez que des athlètes.' : 'Vous ne voyez que des coachs.'}
            </li>
            <li className="flex gap-2">
              <Flame className="size-4 shrink-0" /> Un match ouvre la messagerie, sans engagement.
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Inscription à FitMatch</CardTitle>
          <CardDescription>
            Bonjour {me.firstName} ! Ce que l'on sait déjà de vous est pré-rempli.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchProfileForm me={me} />
        </CardContent>
      </Card>
    </div>
  )
}

function MatchingHome({
  me,
  onOpenConversation,
}: {
  me: MyMatchProfile
  onOpenConversation?: (conversationId: string) => void
}) {
  const [tab, setTab] = useState('discover')
  const [celebrated, setCelebrated] = useState<Match | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const feed = useFeed(true)
  const { data: matches } = useMatches()
  const messageMatch = useMessageMatch()

  const openConversation = async (match: Match) => {
    setOpeningId(match.id)
    try {
      const conversationId = await messageMatch.open(match.counterpartId)
      setCelebrated(null)
      onOpenConversation?.(conversationId)
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="discover">
            <HeartDumbbell /> Découvrir
          </TabsTrigger>
          <TabsTrigger value="matches">
            Mes matchs
            {matches && matches.length > 0 && (
              <Badge className="ml-1 h-5 min-w-5 px-1.5">{matches.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Settings2 /> Mon profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="pt-4">
          {!me.profile?.visible && (
            <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
              Votre profil est masqué : vous pouvez swiper, mais personne ne vous voit.
            </p>
          )}
          {feed.isLoading ? (
            <Loader2
              className="mx-auto size-6 animate-spin text-muted-foreground"
              aria-label="Chargement"
            />
          ) : (
            <SwipeDeck
              candidates={feed.data ?? []}
              onMatch={setCelebrated}
              onRefresh={() => void feed.refetch()}
              refreshing={feed.isFetching}
            />
          )}
        </TabsContent>

        <TabsContent value="matches" className="pt-4">
          <MatchList onMessage={(m) => void openConversation(m)} messagingId={openingId} />
        </TabsContent>

        <TabsContent value="profile" className="pt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Mon profil FitMatch</CardTitle>
              <CardDescription>
                Ce que voient les {me.side === 'COACH' ? 'athlètes' : 'coachs'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchProfileForm me={me} onSaved={() => setTab('discover')} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MatchDialog
        match={celebrated}
        onClose={() => setCelebrated(null)}
        onMessage={(m) => void openConversation(m)}
        messaging={openingId !== null}
      />
    </>
  )
}

import { Mail, ShieldCheck } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_LABELS, useSession } from '@/lib/auth/session'
import { initials } from '@/lib/utils'

export function ProfilePage() {
  const user = useSession((s) => s.user)
  if (!user) return null
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <>
      <PageHeader title="Mon profil" description="Informations du compte et préférences." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <Avatar className="size-20">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
              <AvatarFallback className="bg-brand text-xl font-semibold text-white">
                {initials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{fullName}</p>
              <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {user.email}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {user.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  <ShieldCheck /> {ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profil sportif et préférences</CardTitle>
            <CardDescription>
              Objectif, niveau, unités, langue, notifications et historique du poids : à construire
              dans <code className="text-foreground">src/features/identity</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  )
}

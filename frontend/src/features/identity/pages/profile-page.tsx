import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2, Mail, MessageSquare, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'

import { PageHeader } from '@/components/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { PostForm } from '@/features/coaching/components/post-form'
import { PostList } from '@/features/coaching/components/post-list'
import { ROLE_LABELS, useHasRole, useSession } from '@/lib/auth/session'
import { initials } from '@/lib/utils'

import { useProfile, useUpdateProfile, useUploadAvatar } from '../hooks/use-profile'
import {
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  type UpdateProfileInput,
  experienceLevels,
  fitnessGoals,
  updateProfileSchema,
} from '../schemas'

export function ProfilePage() {
  const user = useSession((s) => s.user)
  const isCoach = useHasRole('COACH')
  const { data: profile, isLoading } = useProfile()

  if (!user) return null
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <>
      <PageHeader title="Mon profil" description="Informations du compte et préférences." />
      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileCard fullName={fullName} />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profil sportif et préférences</CardTitle>
            <CardDescription>Objectif, niveau, unités, langue et notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !profile ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <ProfileForm profile={profile} />
            )}
          </CardContent>
        </Card>
      </div>

      {isCoach && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-4" /> Mes publications
            </CardTitle>
            <CardDescription>
              Visibles uniquement par vous et vos athlètes rattachés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PostForm coachId={user.id} />
            <PostList coachId={user.id} canDelete />
          </CardContent>
        </Card>
      )}
    </>
  )
}

function ProfileCard({ fullName }: { fullName: string }) {
  const user = useSession((s) => s.user)
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  return (
    <Card className="lg:col-span-1">
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="group relative">
          <Avatar className="size-20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-brand text-xl font-semibold text-white">
              {initials(fullName)}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="absolute -right-1 -bottom-1 rounded-full shadow"
            disabled={uploadAvatar.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadAvatar.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Camera className="size-3.5" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadAvatar.mutate(file)
              e.target.value = ''
            }}
          />
        </div>
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
  )
}

function ProfileForm({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>['data']> }) {
  const updateProfile = useUpdateProfile()
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio ?? '',
      fitnessGoal: profile.fitnessGoal,
      experienceLevel: profile.experienceLevel,
      unitSystem: profile.unitSystem,
      locale: profile.locale,
      notificationsEnabled: profile.notificationsEnabled,
    },
  })

  const onSubmit = form.handleSubmit((values) => updateProfile.mutate(values))

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Quelques mots sur vous..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fitnessGoal"
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
                    {fitnessGoals.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {FITNESS_GOAL_LABELS[goal]}
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
            name="experienceLevel"
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
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {EXPERIENCE_LEVEL_LABELS[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="unitSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unités</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="METRIC">Métrique (kg, cm)</SelectItem>
                    <SelectItem value="IMPERIAL">Impérial (lb, in)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="locale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Langue</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notificationsEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
              </FormControl>
              <FormLabel className="font-normal">Recevoir les notifications</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="animate-spin" />}
          Enregistrer
        </Button>
      </form>
    </Form>
  )
}

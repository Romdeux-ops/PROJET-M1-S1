import { zodResolver } from '@hookform/resolvers/zod'
import { Dumbbell, Loader2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { PasswordInput } from '@/components/password-input'
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
import { cn } from '@/lib/utils'

import { useRegister } from '../hooks/use-auth'
import { type RegisterInput, registerSchema } from '../schemas'
import { FormError } from './form-error'

const ROLE_OPTIONS = [
  { value: 'ATHLETE', label: 'Athlète', description: 'Je suis mes séances', icon: Dumbbell },
  { value: 'COACH', label: 'Coach', description: "J'accompagne des athlètes", icon: Users },
] as const

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const registerMutation = useRegister(redirectTo)
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'ATHLETE',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = form.handleSubmit((values) => registerMutation.mutate(values))

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError error={registerMutation.error} />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Je suis</FormLabel>
              <div role="radiogroup" className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                  const selected = field.value === value
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(value)}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                        'outline-none hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        selected && 'border-primary bg-primary/5 ring-2 ring-primary/20',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5',
                          selected ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </button>
                  )
                })}
              </div>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" {...field} />
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
                  <Input autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="vous@exemple.fr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmation</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending && <Loader2 className="animate-spin" />}
          Créer mon compte
        </Button>
      </form>
    </Form>
  )
}

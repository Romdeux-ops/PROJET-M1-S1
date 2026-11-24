import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Shake } from '@/components/motion/shake'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
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

import { useLogin } from '../hooks/use-auth'
import { type LoginInput, loginSchema } from '../schemas'
import { FormError } from './form-error'

const DEMO_ACCOUNTS = [
  { label: 'Athlète', email: 'athlete@fitcoach.dev' },
  { label: 'Coach', email: 'coach@fitcoach.dev' },
  { label: 'Admin', email: 'admin@fitcoach.dev' },
]
const DEMO_PASSWORD = 'Password1'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const login = useLogin(redirectTo)
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit((values) => login.mutate(values))

  return (
    <Form {...form}>
      <Shake trigger={login.error}>
        <form onSubmit={onSubmit} noValidate>
          <Stagger className="space-y-4">
            <FormError error={login.error} />
            <StaggerItem>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="vous@exemple.fr"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </StaggerItem>
            <StaggerItem>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete="current-password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </StaggerItem>
            <StaggerItem>
              <Button
                type="submit"
                size="lg"
                className="group relative w-full overflow-hidden"
                disabled={login.isPending}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.2s_ease-in-out]" />
                <span className="relative flex items-center gap-2">
                  {login.isPending && <Loader2 className="animate-spin" />}
                  Se connecter
                </span>
              </Button>
            </StaggerItem>

            {import.meta.env.VITE_ENABLE_MOCKS === 'true' && (
              <div className="space-y-2 rounded-lg border border-dashed bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Mode démo (mocks) : connexion rapide avec un compte de test.
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <Button
                      key={account.email}
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        login.mutate({ email: account.email, password: DEMO_PASSWORD })
                      }
                    >
                      {account.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Stagger>
        </form>
      </Shake>
    </Form>
  )
}

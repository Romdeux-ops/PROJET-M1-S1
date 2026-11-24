import { zodResolver } from '@hookform/resolvers/zod'
import { Dumbbell, Loader2, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Shake } from '@/components/motion/shake'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { useAnimationsEnabled } from '@/components/motion/use-animations-enabled'
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
import { PasswordStrength } from './password-strength'

const ROLE_OPTIONS = [
  { value: 'ATHLETE', label: 'Athlète', description: 'Je suis mes séances', icon: Dumbbell },
  { value: 'COACH', label: 'Coach', description: "J'accompagne des athlètes", icon: Users },
] as const

export function RegisterForm() {
  const registerMutation = useRegister()
  const animated = useAnimationsEnabled()
  const pillId = useId()
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
  const password = useWatch({ control: form.control, name: 'password' })

  return (
    <Form {...form}>
      <Shake trigger={registerMutation.error}>
        <form onSubmit={onSubmit} noValidate>
          <Stagger className="space-y-4">
            <FormError error={registerMutation.error} />

            <StaggerItem>
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
                              'relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                              'outline-none hover:-translate-y-0.5 hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                              selected &&
                                !animated &&
                                'border-primary bg-primary/5 ring-2 ring-primary/20',
                            )}
                          >
                            {animated && selected && (
                              <motion.span
                                layoutId={pillId}
                                aria-hidden
                                className="absolute inset-0 rounded-lg border-2 border-primary bg-primary/5 shadow-md shadow-primary/15"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              />
                            )}
                            <motion.span
                              className="relative inline-flex"
                              animate={
                                animated
                                  ? {
                                      scale: selected ? 1.2 : 1,
                                      rotate: selected ? [0, -14, 10, 0] : 0,
                                    }
                                  : {}
                              }
                              transition={{ duration: 0.4 }}
                            >
                              <Icon
                                className={cn(
                                  'size-5',
                                  selected ? 'text-primary' : 'text-muted-foreground',
                                )}
                              />
                            </motion.span>
                            <span className="relative text-sm font-medium">{label}</span>
                            <span className="relative text-xs text-muted-foreground">
                              {description}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </FormItem>
                )}
              />
            </StaggerItem>

            <StaggerItem>
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
            </StaggerItem>

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
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <PasswordStrength password={password} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </StaggerItem>
            <StaggerItem>
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
            </StaggerItem>

            <StaggerItem>
              <Button
                type="submit"
                size="lg"
                className="group relative w-full overflow-hidden"
                disabled={registerMutation.isPending}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.2s_ease-in-out]" />
                <span className="relative flex items-center gap-2">
                  {registerMutation.isPending && <Loader2 className="animate-spin" />}
                  Créer mon compte
                </span>
              </Button>
            </StaggerItem>
          </Stagger>
        </form>
      </Shake>
    </Form>
  )
}

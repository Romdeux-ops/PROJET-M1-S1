import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Prénom requis').max(50),
    lastName: z.string().trim().min(1, 'Nom requis').max(50),
    email: z.email('Adresse e-mail invalide'),
    role: z.enum(['ATHLETE', 'COACH']),
    password: z
      .string()
      .min(8, '8 caractères minimum')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/\d/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

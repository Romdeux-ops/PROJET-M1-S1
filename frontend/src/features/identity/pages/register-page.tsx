import { Link } from '@tanstack/react-router'

import { RegisterForm } from '../components/register-form'

export function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-muted-foreground">Quelques secondes pour démarrer votre suivi.</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}

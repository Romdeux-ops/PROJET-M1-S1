import { Link } from '@tanstack/react-router'

import { LoginForm } from '../components/login-form'

export function LoginPage({ redirectTo }: { redirectTo?: string }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bon retour</h1>
        <p className="text-muted-foreground">Connectez-vous pour reprendre votre progression.</p>
      </div>
      <LoginForm redirectTo={redirectTo} />
      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

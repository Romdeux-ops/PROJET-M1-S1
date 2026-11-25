import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { useSession } from '@/lib/auth/session'

import { authApi, type AuthResponse } from '../api/auth-api'

function useOnAuthenticated(redirectTo?: string) {
  const setSession = useSession((s) => s.setSession)
  const navigate = useNavigate()
  return ({ accessToken, user }: AuthResponse) => {
    setSession(accessToken, user)
    void navigate({ to: redirectTo ?? '/dashboard' })
  }
}

export function useLogin(redirectTo?: string) {
  const onSuccess = useOnAuthenticated(redirectTo)
  return useMutation({
    mutationFn: authApi.login,
    onSuccess,
    meta: { silentError: true },
  })
}

export function useRegister(redirectTo?: string) {
  const onSuccess = useOnAuthenticated(redirectTo)
  return useMutation({
    mutationFn: authApi.register,
    onSuccess,
    meta: { silentError: true, successMessage: 'Bienvenue sur FitCoach !' },
  })
}

export function useLogout() {
  const logout = useSession((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return () => {
    logout()
    queryClient.clear()
    void navigate({ to: '/' })
  }
}

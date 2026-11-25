/** N'accepte que des chemins internes pour eviter les redirections ouvertes. */
export function safeRedirect(redirect?: string) {
  return redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : undefined
}

interface ImportMetaEnv {
  /** URL absolue du backend. Vide en dev : les appels passent par le proxy Vite `/api`. */
  readonly VITE_API_URL?: string
  /** `true` pour intercepter les appels API avec MSW (voir src/mocks). */
  readonly VITE_ENABLE_MOCKS?: string
  readonly VITE_DEVTOOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

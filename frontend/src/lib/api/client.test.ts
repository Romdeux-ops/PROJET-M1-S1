import { describe, expect, it } from 'vitest'

import { isSessionRejected } from './client'

function request(withToken: boolean) {
  const headers = new Headers()
  if (withToken) headers.set('Authorization', 'Bearer abc')
  return { headers }
}

function response(status: number, challenge?: string) {
  const headers = new Headers()
  if (challenge) headers.set('WWW-Authenticate', challenge)
  return new Response(null, { status, headers })
}

describe('isSessionRejected', () => {
  it('reconnait un jeton rejete : 401 avec defi Bearer sur une requete authentifiee', () => {
    expect(isSessionRejected(request(true), response(401, 'Bearer'))).toBe(true)
  })

  it('ignore un 401 metier sans defi, comme un mauvais mot de passe', () => {
    expect(isSessionRejected(request(true), response(401))).toBe(false)
  })

  it('ignore un 401 sur une requete qui ne portait pas de jeton', () => {
    expect(isSessionRejected(request(false), response(401, 'Bearer'))).toBe(false)
  })

  it('ne deconnecte jamais sur une erreur serveur', () => {
    expect(isSessionRejected(request(true), response(500))).toBe(false)
  })
})

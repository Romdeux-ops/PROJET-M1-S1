import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { db } from '@/mocks/db'
import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { messagingKeys } from '../hooks/use-messaging'
import { MessagingPage } from './messaging-page'

describe('MessagingPage', () => {
  describe('athlète', () => {
    beforeEach(() => loginAs('ATHLETE'))

    it('liste la conversation avec son coach et son message non lu', async () => {
      renderWithProviders(<MessagingPage />)

      expect(await screen.findByRole('button', { name: /hugo bernard/i })).toBeInTheDocument()
      expect(screen.getByLabelText('1 non lu(s)')).toBeInTheDocument()
    })

    it("ouvre la conversation, affiche l'historique et la marque comme lue", async () => {
      const { user } = renderWithProviders(<MessagingPage />)

      await user.click(await screen.findByRole('button', { name: /hugo bernard/i }))

      expect(await screen.findByText('Bienvenue Léa ! Ton programme est prêt.')).toBeInTheDocument()
      await waitFor(() => expect(screen.queryByLabelText('1 non lu(s)')).not.toBeInTheDocument())
    })

    it('envoie un message qui apparaît dans le fil', async () => {
      const { user } = renderWithProviders(<MessagingPage />)
      await user.click(await screen.findByRole('button', { name: /hugo bernard/i }))
      await screen.findByText('Merci ! Je commence demain.')

      await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Séance faite !')
      await user.click(screen.getByRole('button', { name: 'Envoyer' }))

      await waitFor(() => expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(''))
      expect(screen.getByText('Séance faite !')).toBeInTheDocument()
    })

    it('marque lu un message arrivé pendant que le fil est ouvert', async () => {
      const { user, queryClient } = renderWithProviders(<MessagingPage />)
      await user.click(await screen.findByRole('button', { name: /hugo bernard/i }))
      await waitFor(() => expect(screen.queryByLabelText('1 non lu(s)')).not.toBeInTheDocument())

      db.messages.push({
        id: 'msg-late',
        conversationId: 'conv-1',
        senderId: 'u-coach',
        body: 'Tu as bien récupéré ?',
        sentAt: new Date().toISOString(),
        readAt: null,
      })
      await queryClient.invalidateQueries({ queryKey: messagingKeys.messages('conv-1') })
      expect(await screen.findByText('Tu as bien récupéré ?')).toBeInTheDocument()

      await queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() })
      await waitFor(() => expect(screen.queryByLabelText(/non lu/)).not.toBeInTheDocument())
    })

    it("affiche le refus du serveur sous le champ d'envoi", async () => {
      server.use(
        http.post('*/api/messaging/conversations/:id/messages', () =>
          HttpResponse.json(
            {
              status: 403,
              detail:
                "La messagerie n'est ouverte qu'entre un coach et un athlète qu'il suit activement.",
            },
            { status: 403, headers: { 'Content-Type': 'application/problem+json' } },
          ),
        ),
      )
      const { user } = renderWithProviders(<MessagingPage />)
      await user.click(await screen.findByRole('button', { name: /hugo bernard/i }))
      await screen.findByText('Merci ! Je commence demain.')

      await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Toujours là ?')
      await user.click(screen.getByRole('button', { name: 'Envoyer' }))

      expect(
        await screen.findByText(
          "La messagerie n'est ouverte qu'entre un coach et un athlète qu'il suit activement.",
        ),
      ).toBeInTheDocument()
    })

    it('affiche un état vide sans conversation', async () => {
      server.use(http.get('*/api/messaging/conversations', () => HttpResponse.json([])))
      renderWithProviders(<MessagingPage />)

      expect(await screen.findByText('Aucune conversation')).toBeInTheDocument()
    })
  })

  describe('coach', () => {
    beforeEach(() => loginAs('COACH'))

    it('voit sa conversation sans non-lu, son dernier message en aperçu', async () => {
      renderWithProviders(<MessagingPage />)

      expect(await screen.findByRole('button', { name: /léa martin/i })).toBeInTheDocument()
      expect(
        screen.getByText('Vous : Pense à noter tes charges à chaque séance.'),
      ).toBeInTheDocument()
      expect(screen.queryByLabelText(/non lu/)).not.toBeInTheDocument()
    })
  })
})

describe('MessagingPage : ergonomie', () => {
  beforeEach(() => loginAs('ATHLETE'))

  it('ouvre la création de conversation depuis le bouton Nouvelle', async () => {
    const { user } = renderWithProviders(<MessagingPage />)
    await screen.findByRole('button', { name: /hugo bernard/i })

    await user.click(screen.getByRole('button', { name: /nouvelle/i }))

    expect(
      await screen.findByRole('dialog', { name: /nouvelle conversation/i }),
    ).toBeInTheDocument()
  })

  it('filtre les conversations par nom', async () => {
    const { user } = renderWithProviders(<MessagingPage />)
    await screen.findByRole('button', { name: /hugo bernard/i })

    await user.type(screen.getByRole('searchbox', { name: /rechercher une conversation/i }), 'zzz')
    expect(screen.queryByRole('button', { name: /hugo bernard/i })).not.toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: /rechercher une conversation/i }))
    expect(screen.getByRole('button', { name: /hugo bernard/i })).toBeInTheDocument()
  })

  it("n'active l'envoi qu'une fois un message saisi", async () => {
    const { user } = renderWithProviders(<MessagingPage />)
    await user.click(await screen.findByRole('button', { name: /hugo bernard/i }))
    await screen.findByText('Merci ! Je commence demain.')

    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Salut')
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeEnabled()
  })

  it('propose un retour à la liste depuis une conversation ouverte', async () => {
    const { user } = renderWithProviders(<MessagingPage />)
    await user.click(await screen.findByRole('button', { name: /hugo bernard/i }))

    await user.click(await screen.findByRole('button', { name: /retour aux conversations/i }))

    expect(await screen.findByText('Sélectionnez une conversation')).toBeInTheDocument()
  })
})

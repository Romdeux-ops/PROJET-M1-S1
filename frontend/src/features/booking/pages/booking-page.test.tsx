import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/node'
import { loginAs, renderWithProviders } from '@/test/utils'

import { BookingPage } from './booking-page'

describe('BookingPage', () => {
  describe('athlète', () => {
    beforeEach(() => loginAs('ATHLETE'))

    it('liste les créneaux libres de son coach et sa réservation', async () => {
      renderWithProviders(<BookingPage />)

      expect(await screen.findAllByRole('button', { name: /réserver/i })).toHaveLength(2)
      expect(await screen.findByText('Confirmée')).toBeInTheDocument()
    })

    it('réserve un créneau, qui passe dans ses réservations', async () => {
      const { user } = renderWithProviders(<BookingPage />)
      const [first] = await screen.findAllByRole('button', { name: /réserver/i })

      await user.click(first!)

      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: /réserver/i })).toHaveLength(1),
      )
      expect(await screen.findAllByText('Confirmée')).toHaveLength(2)
    })

    it('annule une réservation', async () => {
      const { user } = renderWithProviders(<BookingPage />)
      await user.click(await screen.findByRole('button', { name: /annuler/i }))

      expect(await screen.findByText('Annulée')).toBeInTheDocument()
      expect(await screen.findAllByRole('button', { name: /réserver/i })).toHaveLength(3)
    })

    it('affiche un état vide sans créneau disponible', async () => {
      server.use(http.get('*/api/booking/slots/available', () => HttpResponse.json([])))
      renderWithProviders(<BookingPage />)

      expect(await screen.findByText('Aucun créneau disponible')).toBeInTheDocument()
    })
  })

  describe('coach', () => {
    beforeEach(() => loginAs('COACH'))

    it('voit ses créneaux libres et réservés', async () => {
      renderWithProviders(<BookingPage />)

      expect(await screen.findByText('Réservé par Léa Martin')).toBeInTheDocument()
      expect(screen.getAllByText('Libre')).toHaveLength(2)
    })

    it('publie un créneau', async () => {
      const { user } = renderWithProviders(<BookingPage />)
      await screen.findByText('Réservé par Léa Martin')

      await user.click(screen.getByRole('button', { name: /publier le créneau/i }))

      await waitFor(() => expect(screen.getAllByText('Libre')).toHaveLength(3))
    })

    it('affiche le refus du serveur sous le formulaire', async () => {
      server.use(
        http.post('*/api/booking/slots', () =>
          HttpResponse.json(
            { status: 409, detail: 'Ce créneau chevauche un de vos créneaux existants.' },
            { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
          ),
        ),
      )
      const { user } = renderWithProviders(<BookingPage />)
      await screen.findByText('Réservé par Léa Martin')

      await user.click(screen.getByRole('button', { name: /publier le créneau/i }))

      expect(
        await screen.findByText('Ce créneau chevauche un de vos créneaux existants.'),
      ).toBeInTheDocument()
    })
  })
})

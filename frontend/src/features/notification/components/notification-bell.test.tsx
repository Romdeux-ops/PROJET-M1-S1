import { screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { db } from '@/mocks/db'
import { loginAs, renderWithProviders } from '@/test/utils'

import { formatRelativeTime } from '../relative-time'
import { NotificationBell } from './notification-bell'

describe('NotificationBell', () => {
  describe('athlète', () => {
    beforeEach(() => loginAs('ATHLETE'))

    it('affiche le nombre de notifications non lues sur la cloche', async () => {
      renderWithProviders(<NotificationBell />)

      expect(
        await screen.findByRole('button', { name: 'Notifications, 1 non lue(s)' }),
      ).toBeInTheDocument()
      expect(screen.getByTestId('notification-badge')).toHaveTextContent('1')
    })

    it("liste les notifications à l'ouverture, les non lues en évidence", async () => {
      const { user } = renderWithProviders(<NotificationBell />)

      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      expect(await screen.findByText("Séance prévue aujourd'hui")).toBeInTheDocument()
      expect(screen.getByText('Séance validée')).toBeInTheDocument()
      expect(screen.getAllByLabelText('Non lue')).toHaveLength(1)
    })

    it('marque lue et ouvre la route au clic sur une notification', async () => {
      const onNavigate = vi.fn()
      const { user } = renderWithProviders(<NotificationBell onNavigate={onNavigate} />)
      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      await user.click(await screen.findByText("Séance prévue aujourd'hui"))

      expect(onNavigate).toHaveBeenCalledWith('/planning')
      await waitFor(() =>
        expect(db.notifications.find((n) => n.id === 'notif-1')?.readAt).not.toBeNull(),
      )
      await waitFor(() =>
        expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument(),
      )
    })

    it('« Tout marquer lu » vide le compteur', async () => {
      const { user } = renderWithProviders(<NotificationBell />)
      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      await user.click(await screen.findByRole('button', { name: /tout marquer lu/i }))

      await waitFor(() =>
        expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument(),
      )
      expect(screen.queryByLabelText('Non lue')).not.toBeInTheDocument()
    })

    it('affiche le rappel de rendez-vous', async () => {
      const { user } = renderWithProviders(<NotificationBell />)

      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      expect(await screen.findByText('Rendez-vous demain')).toBeInTheDocument()
    })

    it("n'affiche aucune notification des autres utilisateurs", async () => {
      db.notifications = db.notifications.filter((n) => n.userId !== 'u-athlete')
      const { user } = renderWithProviders(<NotificationBell />)

      await user.click(await screen.findByRole('button', { name: 'Notifications' }))

      expect(await screen.findByText('Aucune notification.')).toBeInTheDocument()
      expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument()
    })
  })

  describe('coach', () => {
    beforeEach(() => loginAs('COACH'))

    it('voit la séance à valider', async () => {
      const { user } = renderWithProviders(<NotificationBell />)

      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      expect(await screen.findByText('Séance à valider')).toBeInTheDocument()
    })

    it('est prévenu des réservations et annulations de créneaux', async () => {
      const { user } = renderWithProviders(<NotificationBell />)

      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      expect(await screen.findByText('Nouvelle réservation')).toBeInTheDocument()
      expect(screen.getByText('Réservation annulée')).toBeInTheDocument()
    })

    it('ouvre la page de réservation depuis une notification de réservation', async () => {
      const onNavigate = vi.fn()
      const { user } = renderWithProviders(<NotificationBell onNavigate={onNavigate} />)
      await user.click(await screen.findByRole('button', { name: /^Notifications/ }))

      await user.click(await screen.findByText('Nouvelle réservation'))

      expect(onNavigate).toHaveBeenCalledWith('/booking')
    })
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-15T12:00:00Z').getTime()

  it.each([
    ['2026-01-15T11:59:40Z', "à l'instant"],
    ['2026-01-15T11:30:00Z', 'il y a 30 minutes'],
    ['2026-01-15T09:00:00Z', 'il y a 3 heures'],
    ['2026-01-14T10:00:00Z', 'hier'],
  ])('%s -> %s', (iso, expected) => {
    expect(formatRelativeTime(iso, now)).toBe(expected)
  })
})

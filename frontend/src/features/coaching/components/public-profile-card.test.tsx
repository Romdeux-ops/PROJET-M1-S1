import { screen, waitFor, within } from '@testing-library/react'

import { db } from '@/mocks/db'
import { loginAs, renderWithProviders } from '@/test/utils'

import { PublicProfileCard } from './public-profile-card'

describe('PublicProfileCard', () => {
  beforeEach(() => loginAs('COACH'))

  it('affiche le profil publié avec son QR code, qui pointe vers la page publique', async () => {
    renderProfile()

    expect(
      await screen.findByRole('img', { name: /qr code du profil public/i }),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Préparateur physique · Musculation')).toBeInTheDocument()
    expect(screen.getByText(`${window.location.origin}/coach/u-coach`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voir ma page/i })).toHaveAttribute(
      'href',
      '/coach/u-coach',
    )
  })

  it("masque le QR code tant que le profil n'est pas public", async () => {
    db.coachPublicProfiles[0]!.enabled = false
    renderProfile()

    expect(await screen.findByText(/apparaît dès que votre profil est public/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /qr code/i })).not.toBeInTheDocument()
  })

  it('publie le profil avec le titre saisi', async () => {
    db.coachPublicProfiles = []
    const { user } = renderProfile()
    await screen.findByText(/apparaît dès que votre profil est public/i)

    await user.click(screen.getByRole('switch', { name: /rendre mon profil public/i }))
    await user.type(screen.getByLabelText('Titre'), 'Coach running')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('img', { name: /qr code/i })).toBeInTheDocument()
    expect(db.coachPublicProfiles[0]).toMatchObject({ enabled: true, headline: 'Coach running' })
  })

  it('borne le titre et la présentation à la saisie', async () => {
    renderProfile()
    await screen.findByRole('img', { name: /qr code/i })

    expect(screen.getByLabelText('Titre')).toHaveAttribute('maxlength', '120')
    expect(screen.getByLabelText('Présentation')).toHaveAttribute('maxlength', '1000')
  })

  it('copie le lien du profil dans le presse-papiers', async () => {
    const { user } = renderProfile()

    await user.click(await screen.findByRole('button', { name: /copier le lien/i }))

    await waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/coach/u-coach`),
    )
  })

  it('propose le téléchargement du QR code', async () => {
    renderProfile()

    const panel = await screen.findByRole('img', { name: /qr code/i })
    expect(panel).toBeInTheDocument()
    expect(within(document.body).getByRole('button', { name: /télécharger le qr/i })).toBeEnabled()
  })
})

function renderProfile() {
  return renderWithProviders(<PublicProfileCard />)
}

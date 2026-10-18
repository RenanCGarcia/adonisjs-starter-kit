import { test } from '@e2e-dev/web'
import { expect } from 'e2e'
import { signInAs, signUp } from './support/api.ts'

test('a member changes their time zone and their language from the profile page', async ({
  screen,
  app,
  browser,
}) => {
  const member = await signUp('Ada Lovelace')

  await signInAs(browser, member)
  await app.open('/profile')

  const timeZoneSelect = () => screen.getByRole('combobox', 'Time zone')
  const saved = () => screen.getByText('Preferences saved')
  // The signup row's own "When" detail is a fixed timestamp this test can read in each zone.
  const signupRow = screen.getByRole('listitem').filter({ hasText: 'created their account' })

  await signupRow.getByText('Details').tap()
  const beforeAnyChange = await signupRow.textContent()

  let kiritimati = beforeAnyChange

  await timeZoneSelect().tap()
  await screen.getByRole('option', '(UTC+14:00) Pacific/Kiritimati').tap()
  await expect(saved()).toBeVisible()
  await expect
    .poll(async () => {
      kiritimati = await signupRow.textContent()

      return kiritimati
    })
    .not.toBe(beforeAnyChange)

  await timeZoneSelect().tap()
  await screen.getByRole('option', '(UTC-09:00) America/Adak').tap()
  await expect(saved()).toBeVisible()
  await expect.poll(() => signupRow.textContent()).not.toBe(kiritimati)

  await screen.getByRole('combobox', 'Language').tap()
  await screen.getByRole('option', 'Português (Brasil)').tap()
  await expect(screen.getByRole('heading', 'Perfil')).toBeVisible()
  await expect(screen.getByText('Preferências')).toBeVisible()
})

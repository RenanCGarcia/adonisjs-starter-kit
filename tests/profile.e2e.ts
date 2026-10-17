import { test } from '@e2e-dev/web'
import { expect } from 'e2e'
import { signInAs, signUp } from './support/api.ts'

test('a member uploads a photo, then removes it and gets their initials back', async ({
  app,
  screen,
  browser,
}) => {
  const member = await signUp('Alan Turing')

  await signInAs(browser, member)
  await app.open('/profile')
  const main = screen.getByRole('main')

  await expect(main.getByText(member.initials)).toBeVisible()

  await screen.getByLabel('Photo file').setInputFiles('tests/fixtures/avatar.png')
  await expect(screen.getByRole('img', 'Your photo')).toBeVisible({ timeout: 10_000 })
  await expect(screen.getByRole('button', 'Replace photo')).toBeVisible()

  await screen.getByRole('button', 'Remove photo').tap()
  await expect(main.getByText(member.initials)).toBeVisible()
  await expect(screen.getByRole('img', 'Your photo')).toBeHidden()
  await expect(screen.getByRole('button', 'Upload photo')).toBeVisible()
})

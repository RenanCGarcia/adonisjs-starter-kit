import { test } from '@e2e-dev/web'
import { expect, unique } from 'e2e'
import { randomUUID } from 'node:crypto'

const API_URL = 'http://localhost:3333/api/v1'

test('a member signs in, sees their profile, and logs out', async ({
  app,
  agent,
  screen,
  browser,
}) => {
  // A throwaway account per run, created through the API since the UI has no sign-up page.
  const fullName = `E2E Member ${Date.now()}`
  const email = `e2e-${Date.now()}@example.test`
  const password = randomUUID().slice(0, 24)

  const signup = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ fullName, email, password, passwordConfirmation: password }),
  })

  expect(signup.status).toBe(200)

  // The profile is protected: a signed-out visit lands on the login form.
  await app.open('/profile')
  await expect(browser).toHaveURL(/\/login/)

  await screen.getByPlaceholder('Email').fill(email)
  await screen.getByPlaceholder('Password').fill(password)
  await screen.getByRole('button', 'Login').tap()
  await expect(browser).toHaveURL('/profile')
  await expect(screen.getByRole('heading', fullName)).toBeVisible()
  await expect(screen.getByText(email)).toBeVisible()

  await agent.act('log out of {account}', { params: { account: unique(email) } })
  await expect(browser).toHaveURL('/login')

  // The token is gone: the profile redirects to login again.
  await app.open('/profile')
  await expect(browser).toHaveURL(/\/login/)
})

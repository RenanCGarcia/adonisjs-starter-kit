import { test } from '@e2e-dev/web'
import { expect } from 'e2e'
import { randomUUID } from 'node:crypto'
import { signUp, uniqueEmail } from './support/api.ts'

test('a visitor signs up and lands on workspace onboarding', async ({ app, screen, browser }) => {
  const password = randomUUID().slice(0, 24)

  await app.open('/signup')
  await screen.getByLabel('Full name').fill('Ada Lovelace')
  await screen.getByLabel('Email').fill(uniqueEmail('signup'))
  await screen.getByLabel('Password').fill(password)
  await screen.getByLabel('Confirm password').fill(password)
  await screen.getByRole('button', 'Create account').tap()

  await expect(browser).toHaveURL('/')
  await expect(screen.getByRole('heading', 'Create your workspace')).toBeVisible()
  await expect(screen.getByRole('button', 'Account menu')).toHaveText('AL')
})

test('signing up with a taken email shows the error on the email field', async ({
  app,
  screen,
}) => {
  const existing = await signUp()

  await app.open('/signup')
  await screen.getByLabel('Email').fill(existing.email)
  await screen.getByLabel('Password').fill(existing.password)
  await screen.getByLabel('Confirm password').fill(existing.password)
  await screen.getByRole('button', 'Create account').tap()

  await expect(screen.getByText('This is already taken.')).toBeVisible()
  await expect(screen.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
})

test('a member signs in, returns to the page they asked for, and logs out', async ({
  app,
  screen,
  browser,
}) => {
  const member = await signUp('Grace Hopper')

  await app.open('/profile')
  await expect(browser).toHaveURL('/login?redirect=%2Fprofile')

  await screen.getByLabel('Email').fill(member.email)
  await screen.getByLabel('Password').fill(member.password)
  await screen.getByRole('button', 'Sign in').tap()
  await expect(browser).toHaveURL('/profile')
  await expect(screen.getByText(member.email)).toBeVisible()

  await screen.getByRole('button', 'Account menu').tap()
  await screen.getByRole('menuitem', 'Log out').tap()
  await expect(browser).toHaveURL('/login')

  // The token is gone: the profile redirects to login again.
  await app.open('/profile')
  await expect(browser).toHaveURL(/\/login/)
})

test('a wrong password keeps the member on the login form with an alert', async ({
  app,
  screen,
  browser,
}) => {
  const member = await signUp()

  await app.open('/login')
  await screen.getByLabel('Email').fill(member.email)
  await screen.getByLabel('Password').fill(`${member.password}-wrong`)
  await screen.getByRole('button', 'Sign in').tap()

  await expect(screen.getByRole('alert')).toHaveText('Invalid email or password.')
  await expect(browser).toHaveURL('/login')
})

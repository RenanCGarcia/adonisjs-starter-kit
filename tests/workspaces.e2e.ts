import { test } from '@e2e-dev/web'
import { expect } from 'e2e'
import { createTenant, signInAs, signUp, unique } from './support/api.ts'

const TENANT_URL = /\/t\/[0-9a-f-]{36}$/

test('onboarding creates the first workspace and opens it', async ({ app, screen, browser }) => {
  const name = unique('Acme')

  await signInAs(browser, await signUp())
  await app.open('/')
  await screen.getByLabel('Workspace name').fill(name)
  await screen.getByRole('button', 'Create workspace').tap()

  await expect(browser).toHaveURL(TENANT_URL)
  await expect(screen.getByRole('heading', name, { level: 1 })).toBeVisible()
  await expect(screen.getByRole('button', `Workspace: ${name}`)).toBeVisible()
})

test('the switcher creates a second workspace and switches between them', async ({
  app,
  screen,
  browser,
}) => {
  const owner = await signUp()
  const first = await createTenant(owner)
  const second = unique('Second')

  await signInAs(browser, owner)
  await app.open('/')
  await expect(browser).toHaveURL(`/t/${first.id}`)

  await screen.getByRole('button', `Workspace: ${first.name}`).tap()
  await screen.getByRole('menuitem', 'New workspace').tap()
  await screen.getByRole('dialog', 'New workspace').getByLabel('Workspace name').fill(second)
  await screen.getByRole('button', 'Create workspace').tap()
  await expect(screen.getByRole('heading', second, { level: 1 })).toBeVisible()
  await expect(screen.getByRole('dialog')).toBeHidden()

  await screen.getByRole('button', `Workspace: ${second}`).tap()
  await screen.getByRole('menuitem', first.name).tap()
  await expect(browser).toHaveURL(`/t/${first.id}`)
  await expect(screen.getByRole('heading', first.name, { level: 1 })).toBeVisible()
})

test('an unknown workspace id shows the not-found state', async ({ app, screen, browser }) => {
  await signInAs(browser, await signUp())
  await app.open('/t/00000000-0000-4000-8000-000000000000')

  await expect(screen.getByRole('heading', 'Workspace not found')).toBeVisible()
  await expect(screen.getByRole('link', 'Go to my workspaces')).toBeVisible()
})

import { test } from '@japa/runner'
import { sessionOf } from '#tests/sessions'
import db from '@adonisjs/lucid/services/db'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'

const account = {
  fullName: null,
  password: 'password123',
  passwordConfirmation: 'password123',
}

/** The access token's id, which a session row carries as `id`: `oat_<base64url id>.<secret>`. */
function sessionIdOf(token: string) {
  return Buffer.from(token.slice('oat_'.length).split('.')[0]!, 'base64url').toString()
}

// Signup itself opens a session: its token is the account's first device, so tests that count
// sessions use it instead of discarding it and opening an uncounted extra one.
async function signUp(client: ApiClient, email: string) {
  const response = await client.visit('auth.new_account.store').json({ ...account, email })
  const { token }: { token: string } = response.body().data

  return token
}

async function login(client: ApiClient, email: string, userAgent: string) {
  const response = await client
    .visit('auth.access_tokens.store')
    .header('user-agent', userAgent)
    .json({ email, password: account.password })

  const { token } = sessionOf(response.body().data)

  return token
}

test.group('Auth | sessions', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('login stores the device info, shown back on the session list', async ({
    client,
    assert,
  }) => {
    await signUp(client, 'ada@example.com')
    const token = await login(client, 'ada@example.com', 'ada-browser/1.0')

    const response = await client.visit('profile.sessions.index').bearerToken(token)

    response.assertStatus(200)
    assert.containsSubset(response.body().data, [
      { id: sessionIdOf(token), userAgent: 'ada-browser/1.0', current: true },
    ])
  })

  test('lists only the user’s own sessions, excluding another user’s and impersonation tokens', async ({
    client,
    assert,
  }) => {
    const token = await signUp(client, 'ada@example.com')
    const otherToken = await signUp(client, 'grace@example.com')

    // A second session of ada's own, so the list proves it isn't just "the current token".
    const secondToken = await login(client, 'ada@example.com', 'device-c')

    // An impersonation token looks like one of ada's own rows (same tokenable_id): fake one the
    // way the admin module's action writes it, to prove the list excludes it by impersonator_id.
    const grace = await db.from('users').where('email', 'grace@example.com').first()
    await db
      .from('auth_access_tokens')
      .where('id', sessionIdOf(secondToken))
      .update({ impersonator_id: grace.id })

    const response = await client.visit('profile.sessions.index').bearerToken(token)

    response.assertStatus(200)
    const ids = response.body().data.map((row: { id: string }) => row.id)
    assert.deepEqual(ids, [sessionIdOf(token)])
    assert.notInclude(ids, sessionIdOf(otherToken))
    assert.notInclude(ids, sessionIdOf(secondToken))
  })

  test('revoking a session makes it answer 401 afterwards', async ({ client }) => {
    const token = await signUp(client, 'ada@example.com')
    const other = await login(client, 'ada@example.com', 'device-b')

    const response = await client
      .visit('profile.sessions.destroy', { id: sessionIdOf(other) })
      .bearerToken(token)

    response.assertStatus(200)

    const revoked = await client.visit('profile.profile.show').bearerToken(other)
    revoked.assertStatus(401)

    const stillWorks = await client.visit('profile.profile.show').bearerToken(token)
    stillWorks.assertStatus(200)
  })

  test('revoking another user’s session id answers 404', async ({ client }) => {
    const token = await signUp(client, 'ada@example.com')
    const otherToken = await signUp(client, 'grace@example.com')

    const response = await client
      .visit('profile.sessions.destroy', { id: sessionIdOf(otherToken) })
      .bearerToken(token)

    response.assertStatus(404)
    response.assertBodyContains({ code: 'E_SESSION_NOT_FOUND' })
  })

  test('revoking every other session keeps the current one working', async ({ client, assert }) => {
    const token = await signUp(client, 'ada@example.com')
    const other = await login(client, 'ada@example.com', 'device-b')

    const response = await client.visit('profile.sessions.destroy_all').bearerToken(token)

    response.assertStatus(200)
    assert.equal(response.body().data.revoked, 1)

    const revoked = await client.visit('profile.profile.show').bearerToken(other)
    revoked.assertStatus(401)

    const stillWorks = await client.visit('profile.profile.show').bearerToken(token)
    stillWorks.assertStatus(200)
  })

  test('refuses to revoke sessions while impersonating', async ({ client }) => {
    const token = await signUp(client, 'ada@example.com')

    const ada = await db.from('users').where('email', 'ada@example.com').first()
    await db
      .from('auth_access_tokens')
      .where('id', sessionIdOf(token))
      .update({ impersonator_id: ada.id })

    const destroy = await client
      .visit('profile.sessions.destroy', { id: sessionIdOf(token) })
      .bearerToken(token)

    destroy.assertStatus(403)
    destroy.assertBodyContains({ code: 'E_IMPERSONATING' })

    const destroyAll = await client.visit('profile.sessions.destroy_all').bearerToken(token)
    destroyAll.assertStatus(403)
  })
})

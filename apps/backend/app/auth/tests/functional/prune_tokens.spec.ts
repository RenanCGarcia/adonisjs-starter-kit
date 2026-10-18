import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import AuditEvent from '#core/models/audit_event'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import PruneExpiredTokens from '#auth/actions/prune_expired_tokens'

const account = {
  fullName: null,
  password: 'password123',
  passwordConfirmation: 'password123',
}

function sessionIdOf(token: string) {
  return Buffer.from(token.slice('oat_'.length).split('.')[0]!, 'base64url').toString()
}

async function signUp(client: ApiClient, email: string) {
  const response = await client.visit('auth.new_account.store').json({ ...account, email })
  const { token }: { token: string } = response.body().data

  return token
}

test.group('Auth | prune tokens', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  // Regression: an idle access token, or an unused emailed one, stays in the tables forever
  // instead of being deleted once past its own expiry.
  test('deletes expired rows from both tables and keeps the live ones', async ({
    client,
    assert,
  }) => {
    const expiredToken = await signUp(client, 'ada@example.com')
    const liveToken = await signUp(client, 'grace@example.com')
    await db
      .from('auth_access_tokens')
      .where('id', sessionIdOf(expiredToken))
      .update({ expires_at: new Date(Date.now() - 1000) })

    const ada = await db.from('users').where('email', 'ada@example.com').first()
    await db.table('user_tokens').insert({
      user_id: ada.id,
      purpose: 'password_reset',
      token_hash: 'expired-hash',
      expires_at: new Date(Date.now() - 1000),
      created_at: new Date(),
    })

    const { accessTokens, userTokens } = await new PruneExpiredTokens().handle()

    assert.equal(accessTokens, 1)
    assert.equal(userTokens, 1)
    assert.isNull(
      await db.from('auth_access_tokens').where('id', sessionIdOf(expiredToken)).first(),
    )
    assert.isNull(await db.from('user_tokens').where('token_hash', 'expired-hash').first())
    assert.isNotNull(
      await db.from('auth_access_tokens').where('id', sessionIdOf(liveToken)).first(),
    )
  })

  // Regression: a session created without an expiry (by code older than the idle timeout, after
  // its backfill migration ran) never expires and is never pruned.
  test('gives a session without an expiry one from its last use, then prunes it if past', async ({
    client,
    assert,
  }) => {
    const idleToken = await signUp(client, 'ada@example.com')
    const activeToken = await signUp(client, 'grace@example.com')
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)

    await db
      .from('auth_access_tokens')
      .where('id', sessionIdOf(idleToken))
      .update({ expires_at: null, last_used_at: fortyDaysAgo })
    await db
      .from('auth_access_tokens')
      .where('id', sessionIdOf(activeToken))
      .update({ expires_at: null, last_used_at: new Date() })

    await new PruneExpiredTokens().handle()

    assert.isNull(await db.from('auth_access_tokens').where('id', sessionIdOf(idleToken)).first())
    const active = await db.from('auth_access_tokens').where('id', sessionIdOf(activeToken)).first()
    assert.isNotNull(active.expires_at)
  })

  // Regression: a run leaves no trace of what it deleted, or a run that deletes nothing (a
  // second run, a concurrent one) adds an event anyway.
  test('records one system event for a run that deletes, none for one that doesn’t', async ({
    client,
    assert,
  }) => {
    const token = await signUp(client, 'ada@example.com')
    await db
      .from('auth_access_tokens')
      .where('id', sessionIdOf(token))
      .update({ expires_at: new Date(Date.now() - 1000) })

    await new PruneExpiredTokens().handle()
    await new PruneExpiredTokens().handle()

    const pruned = await AuditEvent.query().where('type', 'auth.tokens_pruned')
    assert.lengthOf(pruned, 1)
    assert.deepInclude(pruned[0]?.toJSON(), { tenantId: null, actorId: null, subjectId: null })
    assert.deepEqual(pruned[0]?.data, { accessTokens: 1, userTokens: 0 })
  })
})

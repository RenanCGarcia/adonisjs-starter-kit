import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const account = {
  fullName: null,
  password: 'password123',
  passwordConfirmation: 'password123',
}

test.group('Auth | throttling', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('blocks login after 5 failures for the same email, but another email from the same IP still works', async ({
    client,
  }) => {
    await client.visit('auth.new_account.store').json({ ...account, email: 'ada@example.com' })
    await client.visit('auth.new_account.store').json({ ...account, email: 'eve@example.com' })

    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await client
        .visit('auth.access_tokens.store')
        .json({ email: 'ada@example.com', password: 'wrong-password' })

      response.assertStatus(400)
    }

    const blocked = await client
      .visit('auth.access_tokens.store')
      .json({ email: 'ada@example.com', password: 'wrong-password' })

    blocked.assertStatus(429)
    blocked.assertHeader('retry-after')

    const otherEmail = await client
      .visit('auth.access_tokens.store')
      .json({ email: 'eve@example.com', password: account.password })

    otherEmail.assertStatus(200)
  })

  test('a successful login resets the failure count for that email and IP', async ({ client }) => {
    await client.visit('auth.new_account.store').json({ ...account, email: 'ada@example.com' })

    for (let attempt = 0; attempt < 4; attempt++) {
      await client
        .visit('auth.access_tokens.store')
        .json({ email: 'ada@example.com', password: 'wrong-password' })
    }

    const success = await client
      .visit('auth.access_tokens.store')
      .json({ email: 'ada@example.com', password: account.password })

    success.assertStatus(200)

    // Were the failure count not reset on success, this 5th failure in a row would be the 9th.
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await client
        .visit('auth.access_tokens.store')
        .json({ email: 'ada@example.com', password: 'wrong-password' })

      response.assertStatus(400)
    }
  })

  test('blocks signup past its per-IP limit', async ({ client }) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await client
        .visit('auth.new_account.store')
        .json({ ...account, email: `signup-${attempt}@example.com` })

      response.assertStatus(200)
    }

    const blocked = await client
      .visit('auth.new_account.store')
      .json({ ...account, email: 'signup-5@example.com' })

    blocked.assertStatus(429)
    blocked.assertHeader('retry-after')
  })

  test('blocks reset requests per email and IP, in any case, but another email from the same IP still works', async ({
    client,
  }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await client
        .visit('auth.password_resets.store')
        .json({ email: attempt % 2 ? 'Ada@Example.com' : 'ada@example.com' })

      response.assertStatus(200)
    }

    const blocked = await client
      .visit('auth.password_resets.store')
      .json({ email: 'ada@example.com' })

    blocked.assertStatus(429)

    const otherEmail = await client
      .visit('auth.password_resets.store')
      .json({ email: 'eve@example.com' })

    otherEmail.assertStatus(200)
  })
})

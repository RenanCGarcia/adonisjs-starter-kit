import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const account = {
  fullName: null,
  password: 'password123',
  passwordConfirmation: 'password123',
}

test.group('Auth | accounts', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('rejects a signup whose email differs from an account only in case', async ({ client }) => {
    await client.visit('auth.new_account.store').json({ ...account, email: 'Ada@Example.com' })

    const response = await client
      .visit('auth.new_account.store')
      .json({ ...account, email: 'ada@example.com' })

    response.assertStatus(422)
  })

  test('logs in with the email in any case', async ({ client }) => {
    await client.visit('auth.new_account.store').json({ ...account, email: 'Ada@Example.com' })

    const response = await client
      .visit('auth.access_tokens.store')
      .json({ email: 'ADA@example.COM', password: account.password })

    response.assertStatus(200)
  })
})

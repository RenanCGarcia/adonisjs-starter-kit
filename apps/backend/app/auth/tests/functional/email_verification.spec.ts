import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import type { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import EmailVerificationMail from '#auth/mails/email_verification_mail'

const account = {
  fullName: null,
  password: 'password123',
  passwordConfirmation: 'password123',
}

/** Pulls the raw token out of the verification link in the most recently queued mail. */
function lastVerificationToken(fake: ReturnType<typeof mail.fake>) {
  const queued = fake.mails.queued()
  const html = queued[queued.length - 1]?.message.toJSON().message.html

  // SAFETY: EmailVerificationMail only ever calls message.htmlView(), which renders to a string.
  const token = (html as string | undefined)?.match(/href="[^"]*\/verify-email\/([a-f0-9]+)"/)?.[1]

  if (!token) throw new Error('No verification link found in the last queued mail')

  return token
}

async function signUp(client: ApiClient, email: string) {
  const response = await client.visit('auth.new_account.store').json({ ...account, email })
  const { token }: { token: string } = response.body().data

  return token
}

test.group('Auth | email verification', group => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('signup mails a link that verifies the email, without signing in', async ({
    client,
    assert,
  }) => {
    using fake = mail.fake()
    const session = await signUp(client, 'ada@example.com')

    fake.mails.assertQueued(EmailVerificationMail, ({ message }) =>
      message.hasTo('ada@example.com'),
    )

    const before = await client.visit('profile.profile.show').bearerToken(session)
    assert.isNull(before.body().data.emailVerifiedAt)

    const verified = await client
      .visit('auth.email_verifications.update')
      .json({ token: lastVerificationToken(fake) })

    verified.assertStatus(200)

    const after = await client.visit('profile.profile.show').bearerToken(session)
    assert.isNotNull(after.body().data.emailVerifiedAt)
  })

  test('refuses an unknown token', async ({ client }) => {
    const response = await client
      .visit('auth.email_verifications.update')
      .json({ token: 'a'.repeat(64) })

    response.assertStatus(400)
    response.assertBodyContains({ code: 'E_INVALID_VERIFICATION_TOKEN' })
  })

  test('resending mails a new link and voids the previous one', async ({ client }) => {
    using fake = mail.fake()
    const session = await signUp(client, 'ada@example.com')
    const first = lastVerificationToken(fake)

    const resent = await client.visit('profile.email_verifications.store').bearerToken(session)
    resent.assertStatus(200)
    fake.mails.assertQueuedCount(EmailVerificationMail, 2)
    const second = lastVerificationToken(fake)

    const stale = await client.visit('auth.email_verifications.update').json({ token: first })
    stale.assertStatus(400)

    const fresh = await client.visit('auth.email_verifications.update').json({ token: second })
    fresh.assertStatus(200)
  })

  test('resending once verified mails nothing', async ({ client }) => {
    using fake = mail.fake()
    const session = await signUp(client, 'ada@example.com')
    await client
      .visit('auth.email_verifications.update')
      .json({ token: lastVerificationToken(fake) })

    const resent = await client.visit('profile.email_verifications.store').bearerToken(session)

    resent.assertStatus(200)
    fake.mails.assertQueuedCount(EmailVerificationMail, 1)
  })
})

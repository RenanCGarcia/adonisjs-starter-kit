import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#auth/types/audit'
import { consumeUserToken } from '#auth/services/user_tokens'
import InvalidVerificationTokenException from '#auth/exceptions/invalid_verification_token_exception'

export interface VerifyEmailInput {
  token: string
}

export default class VerifyEmail {
  async handle({ token }: VerifyEmailInput) {
    return db.transaction(async trx => {
      const user = await consumeUserToken(trx, 'email_verification', token)

      if (!user) throw new InvalidVerificationTokenException()

      // Verified meanwhile through a password reset or an invitation: keep that first date.
      user.emailVerifiedAt ??= DateTime.now()
      await user.save()

      await audit.record(trx, 'auth.email_verified', {
        tenantId: null,
        subject: { type: 'user', id: user.id },
        actorId: user.id,
        data: { email: user.email },
      })

      return user
    })
  }
}

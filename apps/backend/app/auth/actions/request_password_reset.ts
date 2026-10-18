import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#auth/types/audit'
import type {} from '#auth/types/events'
import emitter from '@adonisjs/core/services/emitter'
import { issueUserToken } from '#auth/services/user_tokens'

export interface RequestPasswordResetInput {
  email: string
  locale: string
}

export default class RequestPasswordReset {
  /**
   * Mails a reset link to an enabled account. Returns nothing either way, so the caller's answer
   * can't tell whether the email has an account.
   */
  async handle({ email, locale }: RequestPasswordResetInput) {
    const user = await User.findBy('email', email)
    const recipient = user && !user.disabledAt ? user : null

    const token = await db.transaction(async trx => {
      const issued = recipient ? await issueUserToken(trx, recipient.id, 'password_reset') : null

      await audit.record(trx, 'auth.password_reset_requested', {
        tenantId: null,
        subject: user ? { type: 'user', id: user.id } : null,
        data: { email },
      })

      return issued
    })

    if (token) await emitter.emit('auth:password_reset_requested', { email, token, locale })
  }
}

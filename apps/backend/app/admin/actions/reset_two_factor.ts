import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#admin/types/audit'
import type {} from '#admin/types/events'
import emitter from '@adonisjs/core/services/emitter'
import { clearTwoFactor } from '#auth/services/two_factor'
import TwoFactorNotEnabledException from '#auth/exceptions/two_factor_not_enabled_exception'

export interface ResetTwoFactorInput {
  id: string
  /** The mail's: the user's own locale isn't stored. */
  locale: string
}

export default class ResetTwoFactor {
  /**
   * Turns off the two-factor of a user who lost their device. Not idempotent: a repeat would mail
   * the user again about a reset that didn't happen. Pair it with RevokeSessions, so a session
   * someone else holds stops working too.
   */
  async handle({ id, locale }: ResetTwoFactorInput) {
    const user = await db.transaction(async trx => {
      const locked = await User.query({ client: trx }).where('id', id).forUpdate().firstOrFail()

      if (!locked.twoFactorConfirmedAt) throw new TwoFactorNotEnabledException()

      await clearTwoFactor(trx, locked)

      await audit.record(trx, 'admin.two_factor_reset', {
        tenantId: null,
        subject: { type: 'user', id: locked.id },
        data: { email: locked.email },
      })

      return locked
    })

    await emitter.emit('admin:two_factor_reset', { email: user.email, locale })

    return user
  }
}

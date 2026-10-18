import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#admin/types/audit'
import type {} from '#admin/types/events'
import emitter from '@adonisjs/core/services/emitter'
import { clearTwoFactor } from '#auth/services/two_factor'
import { mailLocaleFor } from '#users/services/mail_locale'
import { ensureNotPlatformAdmin } from '#admin/services/protect_platform_admins'
import TwoFactorNotEnabledException from '#auth/exceptions/two_factor_not_enabled_exception'

export interface ResetTwoFactorInput {
  id: string
  /** False only for `node ace admin:reset-two-factor`, the operator's way to reset an admin. */
  protectPlatformAdmins: boolean
}

export default class ResetTwoFactor {
  /**
   * Turns off the two-factor of a user who lost their device. Not idempotent: a repeat would mail
   * the user again about a reset that didn't happen. Signs the user out everywhere, so a session
   * on the lost device stops working too.
   */
  async handle({ id, protectPlatformAdmins }: ResetTwoFactorInput) {
    const { user, revoked } = await db.transaction(async trx => {
      const locked = await User.query({ client: trx }).where('id', id).forUpdate().firstOrFail()

      if (protectPlatformAdmins) await ensureNotPlatformAdmin(locked.id, trx)

      if (!locked.twoFactorConfirmedAt) throw new TwoFactorNotEnabledException()

      await clearTwoFactor(trx, locked)

      // In the same transaction, so a failure can't leave 2FA off with the lost device signed in,
      // where a retry would stop at "not enabled". Impersonation sessions are the admin's.
      const deleted = await trx
        .from('auth_access_tokens')
        .where('tokenable_id', locked.id)
        .whereNull('impersonator_id')
        .delete()

      await audit.record(trx, 'admin.two_factor_reset', {
        tenantId: null,
        subject: { type: 'user', id: locked.id },
        data: { email: locked.email },
      })

      return { user: locked, revoked: Number(deleted) }
    })

    await emitter.emit('admin:two_factor_reset', {
      email: user.email,
      locale: mailLocaleFor(user),
    })

    return { user, revoked }
  }
}

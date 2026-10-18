import type User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import RevokeSessions from '#auth/actions/revoke_sessions'
import ConfirmTwoFactor from '#auth/actions/confirm_two_factor'
import DisableTwoFactor from '#auth/actions/disable_two_factor'
import RegenerateRecoveryCodes from '#auth/actions/regenerate_recovery_codes'
import StartTwoFactorEnrollment from '#auth/actions/start_two_factor_enrollment'
import { countRecoveryCodes, secondFactorOf } from '#auth/services/two_factor'
import ImpersonatingException from '#auth/exceptions/impersonating_exception'
import {
  confirmTwoFactorValidator,
  disableTwoFactorValidator,
  regenerateRecoveryCodesValidator,
} from '#auth/validators/two_factor'

/** An admin acting as the user never changes how the user signs in. */
function ownUser({ auth }: HttpContext): User {
  const user = auth.getUserOrFail()

  if (user.currentAccessToken?.impersonatorId) throw new ImpersonatingException()

  return user
}

export default class TwoFactorController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    return serialize({
      enabled: user.twoFactorConfirmedAt !== null,
      recoveryCodesLeft: user.twoFactorConfirmedAt
        ? await countRecoveryCodes(db.connection(), user.id)
        : 0,
    })
  }

  /** Starts, or restarts, enrollment: the secret to show as a QR code and for manual entry. */
  async store(ctx: HttpContext) {
    const user = ownUser(ctx)

    return ctx.serialize(await new StartTwoFactorEnrollment().handle({ user }))
  }

  async confirm(ctx: HttpContext) {
    const user = ownUser(ctx)
    const { code } = await ctx.request.validateUsing(confirmTwoFactorValidator)

    const recoveryCodes = await new ConfirmTwoFactor().handle({ user, code })

    // Every session must have passed a second factor: only this one, which just did, stays.
    const keepTokenId = String(user.currentAccessToken!.identifier)
    await new RevokeSessions().handle({ user, keepTokenId })

    return ctx.serialize({ recoveryCodes })
  }

  async destroy(ctx: HttpContext) {
    const user = ownUser(ctx)
    const { password, ...factor } = await ctx.request.validateUsing(disableTwoFactorValidator)

    await new DisableTwoFactor().handle({ user, password, factor: secondFactorOf(factor) })

    return ctx.serialize({ message: ctx.i18n.t('auth.two_factor_disabled') })
  }

  async regenerateRecoveryCodes(ctx: HttpContext) {
    const user = ownUser(ctx)
    const { password, code } = await ctx.request.validateUsing(regenerateRecoveryCodesValidator)

    const recoveryCodes = await new RegenerateRecoveryCodes().handle({ user, password, code })

    return ctx.serialize({ recoveryCodes })
  }
}

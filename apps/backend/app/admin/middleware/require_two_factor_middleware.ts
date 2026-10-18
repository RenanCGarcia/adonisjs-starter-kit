import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import TwoFactorRequiredException from '#admin/exceptions/two_factor_required_exception'

/**
 * A platform admin without confirmed two-factor authentication can't use the admin area. Anyone
 * else passes, to get the route's own authorization failure. Confirming two-factor revokes every
 * other session, so a confirmed account's session has passed a second factor.
 */
export default class RequireTwoFactorMiddleware {
  async handle({ auth, bouncer }: HttpContext, next: NextFn) {
    const user = auth.getUserOrFail()

    if (!user.twoFactorConfirmedAt && (await bouncer.allows(can, PERMISSIONS.platformAdmin))) {
      throw new TwoFactorRequiredException()
    }

    return next()
  }
}

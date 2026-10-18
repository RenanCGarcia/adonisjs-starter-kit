import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import { userParamsValidator } from '#admin/validators/user'
import RevokeSessions from '#auth/actions/revoke_sessions'
import ResetTwoFactor from '#admin/actions/reset_two_factor'
import { ensureNotPlatformAdmin } from '#admin/services/protect_platform_admins'

export default class TwoFactorResetsController {
  async destroy({ bouncer, i18n, request, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.platformAdmin)
    const { params } = await request.validateUsing(userParamsValidator)

    // Here rather than in the action: `node ace admin:reset-two-factor` resets an admin's.
    await ensureNotPlatformAdmin(params.id)

    const user = await new ResetTwoFactor().handle({ id: params.id, locale: i18n.locale })
    await new RevokeSessions().handle({ user })

    return serialize({ id: user.id, twoFactorEnabled: false })
  }
}

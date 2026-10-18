import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import { userParamsValidator } from '#admin/validators/user'
import ResetTwoFactor from '#admin/actions/reset_two_factor'

export default class TwoFactorResetsController {
  async destroy({ bouncer, i18n, request, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.platformAdmin)
    const { params } = await request.validateUsing(userParamsValidator)

    const { user } = await new ResetTwoFactor().handle({
      id: params.id,
      locale: i18n.locale,
      protectPlatformAdmins: true,
    })

    return serialize({ id: user.id, twoFactorEnabled: false })
  }
}

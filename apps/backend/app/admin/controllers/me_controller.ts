import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'

export default class MeController {
  /**
   * Whether the signed-in user may open the admin area, for the frontend to show its entry, and
   * whether they must enable two-factor first: every other admin route refuses them until then.
   */
  async show({ auth, bouncer, serialize }: HttpContext) {
    const platformAdmin = await bouncer.allows(can, PERMISSIONS.platformAdmin)

    return serialize({
      platformAdmin,
      twoFactorRequired: platformAdmin && !auth.getUserOrFail().twoFactorConfirmedAt,
    })
  }
}

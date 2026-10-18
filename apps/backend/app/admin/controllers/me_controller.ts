import type { HttpContext } from '@adonisjs/core/http'
import PlatformAdmin from '#access/models/platform_admin'

export default class MeController {
  /**
   * Whether the signed-in user may open the admin area, for the frontend to show its entry, and
   * whether they must enable two-factor first: every other admin route refuses them until then.
   * It reads `platform_admins` rather than the `can` ability, which denies an admin without
   * two-factor.
   */
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const platformAdmin = Boolean(await PlatformAdmin.findBy('userId', user.id))

    return serialize({
      platformAdmin,
      twoFactorRequired: platformAdmin && !user.twoFactorConfirmedAt,
    })
  }
}

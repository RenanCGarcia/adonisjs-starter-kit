import { can } from '#access/abilities'
import type { HttpContext } from '@adonisjs/core/http'
import { ALL_PERMISSIONS } from '#access/permissions'

export default class MyPermissionsController {
  /** What the signed-in user passes, for the frontend to gate its UI. */
  async show({ bouncer, serialize }: HttpContext) {
    const allowed = await Promise.all(
      ALL_PERMISSIONS.map(permission => bouncer.allows(can, permission)),
    )

    return serialize({ permissions: ALL_PERMISSIONS.filter((_, index) => allowed[index]) })
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import { PERMISSION_GROUPS } from '#access/permissions'

export default class PermissionCatalogController {
  /** Any member: the catalog grouped, for the frontend to render it organized. */
  async show({ serialize }: HttpContext) {
    return serialize({ groups: PERMISSION_GROUPS })
  }
}

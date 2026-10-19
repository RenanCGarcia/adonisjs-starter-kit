import type { HttpContext } from '@adonisjs/core/http'
import { PERMISSION_GROUPS } from '#access/permissions'

/**
 * @tags Permissions
 */
export default class PermissionCatalogController {
  /**
   * List the permission catalog
   *
   * Any member of the tenant may call it. Returns every permission a role or a member can
   * hold, grouped by area, for rendering role and permission editors.
   *
   * @throws {400} The X-Tenant-Id header is missing or not a UUID
   * @throws {403} Not a member of the tenant, or the tenant is suspended
   */
  async show({ serialize }: HttpContext) {
    return serialize({ groups: PERMISSION_GROUPS })
  }
}

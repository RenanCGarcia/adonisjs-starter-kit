import { can } from '#access/abilities'
import ListUsers from '#admin/queries/list_users'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import { listUsersValidator } from '#admin/validators/user'
import AdminUserTransformer from '#admin/transformers/admin_user_transformer'

/**
 * @tags Admin
 */
export default class UsersController {
  /**
   * List users
   *
   * Requires `platform.admin`. Lists every user on the platform, ordered by email, with their
   * tenant count and whether they are a platform admin. `search` matches part of the email or
   * full name, ignoring case.
   *
   * @throws {403} Not a platform admin
   */
  async index({ bouncer, request, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.platformAdmin)
    const filters = await request.validateUsing(listUsersValidator)

    const { rows, meta } = await new ListUsers().handle(filters)

    return serialize(AdminUserTransformer.paginate(rows, meta))
  }
}

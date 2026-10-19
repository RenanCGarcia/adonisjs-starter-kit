import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import ReplaceGrants from '#access/actions/replace_grants'
import { replaceGrantsValidator } from '#access/validators/member'

/**
 * @tags Members
 */
export default class MemberPermissionsController {
  /**
   * Replace a member's individual permissions
   *
   * Requires `members.manage`. The member's individual permissions become exactly the given
   * list; an empty list removes them all. Permissions from their role are not affected.
   *
   * @throws {400} The X-Tenant-Id header is missing or not a UUID
   * @throws {403} Not a member of the tenant, the tenant is suspended, or lacks `members.manage`
   * @throws {404} The user is not a member of the tenant
   * @throws {409} The change would leave no one able to manage members
   */
  async update({ bouncer, request, tenant, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.membersManage)
    const { params, permissions } = await request.validateUsing(replaceGrantsValidator)

    await new ReplaceGrants().handle({ tenantId: tenant.id, userId: params.userId, permissions })

    return serialize({ permissions })
  }
}

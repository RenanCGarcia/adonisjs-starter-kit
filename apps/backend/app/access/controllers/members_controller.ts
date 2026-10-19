import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import ListMembers from '#access/queries/list_members'
import MemberTransformer from '#access/transformers/member_transformer'

/**
 * @tags Members
 */
export default class MembersController {
  /**
   * List members
   *
   * Requires `members.manage`. Returns each member's profile, role id and individual
   * permissions, sorted by name, or by email when the name is empty.
   *
   * @throws {400} The X-Tenant-Id header is missing or not a UUID
   * @throws {403} Not a member of the tenant, the tenant is suspended, or lacks `members.manage`
   */
  async index({ bouncer, tenant, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.membersManage)

    const members = await new ListMembers().handle({ tenantId: tenant.id })

    // Depth 3: members -> user -> avatar, the one relationship UserTransformer embeds.
    return serialize({ members: MemberTransformer.transform(members).depth(3) })
  }
}

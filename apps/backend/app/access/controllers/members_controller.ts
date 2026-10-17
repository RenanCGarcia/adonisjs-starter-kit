import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import ListMembers from '#access/queries/list_members'
import MemberTransformer from '#access/transformers/member_transformer'

export default class MembersController {
  async index({ bouncer, tenant, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.membersManage)

    const members = await new ListMembers().handle({ tenantId: tenant.id })

    // Depth 3: members -> user -> avatar, the one relationship UserTransformer embeds.
    return serialize({ members: MemberTransformer.transform(members).depth(3) })
  }
}

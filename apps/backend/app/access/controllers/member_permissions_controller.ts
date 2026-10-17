import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import ReplaceGrants from '#access/actions/replace_grants'
import { replaceGrantsValidator } from '#access/validators/member'

export default class MemberPermissionsController {
  async update({ bouncer, request, tenant, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.membersManage)
    const { params, permissions } = await request.validateUsing(replaceGrantsValidator)

    await new ReplaceGrants().handle({ tenantId: tenant.id, userId: params.userId, permissions })

    return serialize({ permissions })
  }
}

import { can } from '#access/abilities'
import { currentScope } from '#access/scope'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import AssignRole from '#access/actions/assign_role'
import { assignRoleValidator } from '#access/validators/member'

export default class MemberRolesController {
  async update({ bouncer, request, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.membersManage)
    const { params, roleId } = await request.validateUsing(assignRoleValidator)

    await new AssignRole().handle({ scope: currentScope(), userId: params.userId, roleId })

    return serialize({ roleId })
  }
}

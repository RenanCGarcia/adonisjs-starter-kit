import { can } from '#access/abilities'
import { currentScope } from '#access/scope'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import ReplaceGrants from '#access/actions/replace_grants'
import { replaceGrantsValidator } from '#access/validators/member'

export default class MemberPermissionsController {
  async update({ bouncer, request, serialize }: HttpContext) {
    await bouncer.authorize(can, PERMISSIONS.membersManage)
    const { params, permissions } = await request.validateUsing(replaceGrantsValidator)

    await new ReplaceGrants().handle({ scope: currentScope(), userId: params.userId, permissions })

    return serialize({ permissions })
  }
}

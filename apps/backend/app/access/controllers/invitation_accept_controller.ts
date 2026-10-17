import Tenant from '#tenancy/models/tenant'
import type { HttpContext } from '@adonisjs/core/http'
import AcceptInvitation from '#access/actions/accept_invitation'
import { acceptInvitationValidator } from '#access/validators/invitation'
import TenantTransformer from '#tenancy/transformers/tenant_transformer'

export default class InvitationAcceptController {
  async store({ request, auth, serialize }: HttpContext) {
    const { token } = await request.validateUsing(acceptInvitationValidator)
    const user = auth.getUserOrFail()

    const tenantId = await new AcceptInvitation().handle({
      token,
      userId: user.id,
      userEmail: user.email,
    })

    const tenant = await Tenant.findOrFail(tenantId)

    return serialize(TenantTransformer.transform(tenant))
  }
}

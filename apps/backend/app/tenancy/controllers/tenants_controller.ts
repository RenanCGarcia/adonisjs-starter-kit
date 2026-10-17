import Tenant from '#tenancy/models/tenant'
import type { HttpContext } from '@adonisjs/core/http'
import CreateTenant from '#tenancy/actions/create_tenant'
import { createTenantValidator } from '#tenancy/validators/tenant'
import TenantTransformer from '#tenancy/transformers/tenant_transformer'

export default class TenantsController {
  async index({ auth, serialize }: HttpContext) {
    const userId = auth.getUserOrFail().id

    const tenants = await Tenant.query()
      .whereHas('memberships', memberships => memberships.where('user_id', userId))
      .orderBy('name')

    return serialize(TenantTransformer.transform(tenants))
  }

  async store({ request, auth, i18n, serialize }: HttpContext) {
    const { name } = await request.validateUsing(createTenantValidator)

    const tenant = await new CreateTenant().handle({
      name,
      creatorId: auth.getUserOrFail().id,
      locale: i18n.locale,
    })

    return serialize(TenantTransformer.transform(tenant))
  }
}

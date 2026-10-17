import vine from '@vinejs/vine'
import Tenant from '#tenancy/models/tenant'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { runInTenant } from '#tenancy/tenant_context'

/**
 * Resolves the tenant named by the X-Tenant-Id header and runs the rest of the
 * request inside it. Must run after `auth`. An unknown tenant and one the user
 * doesn't belong to get the same 403, so ids can't be probed.
 */
export default class TenantMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const tenantId = ctx.request.header('x-tenant-id')

    if (!tenantId || !vine.helpers.isUUID(tenantId)) {
      return ctx.response.badRequest({
        message: ctx.i18n.t('errors.E_INVALID_TENANT_HEADER'),
        key: 'E_INVALID_TENANT_HEADER',
      })
    }

    const userId = ctx.auth.getUserOrFail().id

    const tenant = await Tenant.query()
      .where('id', tenantId)
      .whereHas('memberships', memberships => memberships.where('user_id', userId))
      .first()

    if (!tenant) {
      return ctx.response.forbidden({
        message: ctx.i18n.t('errors.E_TENANT_ACCESS_DENIED'),
        key: 'E_TENANT_ACCESS_DENIED',
      })
    }

    ctx.tenant = tenant

    return runInTenant(tenant.id, () => next())
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    tenant: Tenant
  }
}

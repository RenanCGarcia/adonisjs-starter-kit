import db from '@adonisjs/lucid/services/db'
import Tenant from '#tenancy/models/tenant'
import emitter from '@adonisjs/core/services/emitter'
import type { TenantCreated } from '#tenancy/types/events'

export interface CreateTenantInput {
  name: string
  creatorId: string
}

export default class CreateTenant {
  /** Awaits the listeners: a failing one fails the request, after the tenant is committed. */
  async handle({ name, creatorId }: CreateTenantInput) {
    const tenant = await db.transaction(async trx => {
      const created = await Tenant.create({ name }, { client: trx })
      await created.related('memberships').create({ userId: creatorId })

      return created
    })

    await emitter.emit('tenancy:tenant_created', {
      tenantId: tenant.id,
      creatorId,
    } satisfies TenantCreated)

    return tenant
  }
}

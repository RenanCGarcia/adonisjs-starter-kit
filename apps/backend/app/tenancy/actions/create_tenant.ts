import db from '@adonisjs/lucid/services/db'
import Tenant from '#tenancy/models/tenant'

export interface CreateTenantInput {
  name: string
  creatorId: string
}

export default class CreateTenant {
  async handle({ name, creatorId }: CreateTenantInput) {
    return db.transaction(async trx => {
      const tenant = await Tenant.create({ name }, { client: trx })
      await tenant.related('memberships').create({ userId: creatorId })

      return tenant
    })
  }
}

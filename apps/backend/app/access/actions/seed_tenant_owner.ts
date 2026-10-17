import db from '@adonisjs/lucid/services/db'
import Role from '#access/models/role'
import RoleAssignment from '#access/models/role_assignment'
import { runInTenant } from '#tenancy/tenant_context'
import { ASSIGNABLE_PERMISSIONS } from '#access/permissions'

export interface SeedTenantOwnerInput {
  tenantId: string
  creatorId: string
}

/**
 * Gives a new tenant an Owner role with every assignable permission, held by its creator.
 * Safe to run again: an existing Owner role, or a role the creator already holds, is kept.
 */
export default class SeedTenantOwner {
  async handle({ tenantId, creatorId }: SeedTenantOwnerInput) {
    await runInTenant(tenantId, () =>
      db.transaction(async trx => {
        const owner = await Role.firstOrCreate(
          { name: 'Owner' },
          { permissions: ASSIGNABLE_PERMISSIONS },
          { client: trx },
        )

        await RoleAssignment.firstOrCreate(
          { userId: creatorId },
          { roleId: owner.id },
          { client: trx },
        )
      }),
    )
  }
}

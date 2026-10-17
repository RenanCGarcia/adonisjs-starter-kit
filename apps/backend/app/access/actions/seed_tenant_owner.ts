import db from '@adonisjs/lucid/services/db'
import i18nManager from '@adonisjs/i18n/services/main'
import Role from '#access/models/role'
import RoleAssignment from '#access/models/role_assignment'
import { runInTenant } from '#tenancy/tenant_context'
import { ASSIGNABLE_PERMISSIONS } from '#access/permissions'

export interface SeedTenantOwnerInput {
  tenantId: string
  creatorId: string
  locale: string
}

/**
 * Gives a new tenant an Owner role, named in the creator's locale, with every assignable
 * permission, held by its creator. Safe to run again with the same locale: an existing Owner
 * role, or a role the creator already holds, is kept.
 */
export default class SeedTenantOwner {
  async handle({ tenantId, creatorId, locale }: SeedTenantOwnerInput) {
    await runInTenant(tenantId, () =>
      db.transaction(async trx => {
        const owner = await Role.firstOrCreate(
          { name: i18nManager.locale(locale).t('access.owner_role') },
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

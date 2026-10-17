import db from '@adonisjs/lucid/services/db'
import Role from '#access/models/role'
import type { Permission } from '#access/permissions'
import { KeepAManager } from '#access/services/keep_a_manager'

export interface UpdateRoleInput {
  tenantId: string
  id: string
  name: string
  permissions: Permission[]
}

export default class UpdateRole {
  async handle({ tenantId, id, name, permissions }: UpdateRoleInput) {
    return db.transaction(trx =>
      new KeepAManager().handle(trx, tenantId, async () => {
        const role = await Role.query({ client: trx }).where('id', id).firstOrFail()

        return role.merge({ name, permissions }).save()
      }),
    )
  }
}

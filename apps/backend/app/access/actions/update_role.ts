import db from '@adonisjs/lucid/services/db'
import Role from '#access/models/role'
import { inScope, type Scope } from '#access/scope'
import type { Permission } from '#access/permissions'
import { KeepAManager } from '#access/services/keep_a_manager'

export interface UpdateRoleInput {
  scope: Scope
  id: string
  name: string
  permissions: Permission[]
}

export default class UpdateRole {
  async handle({ scope, id, name, permissions }: UpdateRoleInput) {
    return db.transaction(trx =>
      new KeepAManager().handle(trx, scope, async () => {
        const role = await inScope(Role.query({ client: trx }), scope, 'roles')
          .where('id', id)
          .firstOrFail()

        return role.merge({ name, permissions }).save()
      }),
    )
  }
}

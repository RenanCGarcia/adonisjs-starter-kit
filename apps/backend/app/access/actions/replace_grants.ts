import db from '@adonisjs/lucid/services/db'
import type { Permission } from '#access/permissions'
import PermissionGrant from '#access/models/permission_grant'
import { KeepAManager } from '#access/services/keep_a_manager'
import { inScope, scopeColumns, type Scope } from '#access/scope'
import MemberNotFoundException from '#access/exceptions/member_not_found_exception'

export interface ReplaceGrantsInput {
  scope: Scope
  userId: string
  permissions: Permission[]
}

export default class ReplaceGrants {
  /** The member's individual permissions in `scope` become exactly `permissions`. */
  async handle({ scope, userId, permissions }: ReplaceGrantsInput) {
    try {
      await db.transaction(trx =>
        new KeepAManager().handle(trx, scope, async () => {
          await inScope(PermissionGrant.query({ client: trx }), scope, 'permission_grants')
            .where('user_id', userId)
            .delete()

          await PermissionGrant.createMany(
            permissions.map(permission => ({ ...scopeColumns(scope), userId, permission })),
            { client: trx },
          )
        }),
      )
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23503')
        throw new MemberNotFoundException()

      throw error
    }
  }
}

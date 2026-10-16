import db from '@adonisjs/lucid/services/db'
import RoleAssignment from '#access/models/role_assignment'
import { KeepAManager } from '#access/services/keep_a_manager'
import { inScope, scopeColumns, type Scope } from '#access/scope'
import MemberNotFoundException from '#access/exceptions/member_not_found_exception'

export interface AssignRoleInput {
  scope: Scope
  userId: string
  roleId: string | null
}

export default class AssignRole {
  /** Replaces the member's role in `scope`; null leaves them without one. */
  async handle({ scope, userId, roleId }: AssignRoleInput) {
    try {
      await db.transaction(trx =>
        new KeepAManager().handle(trx, scope, async () => {
          await inScope(RoleAssignment.query({ client: trx }), scope, 'role_assignments')
            .where('user_id', userId)
            .delete()

          if (roleId) {
            await RoleAssignment.create({ ...scopeColumns(scope), userId, roleId }, { client: trx })
          }
        }),
      )
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23503')
        throw new MemberNotFoundException()

      throw error
    }
  }
}

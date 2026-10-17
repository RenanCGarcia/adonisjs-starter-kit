import db from '@adonisjs/lucid/services/db'
import RoleAssignment from '#access/models/role_assignment'
import { KeepAManager } from '#access/services/keep_a_manager'
import MemberNotFoundException from '#access/exceptions/member_not_found_exception'

export interface AssignRoleInput {
  tenantId: string
  userId: string
  roleId: string | null
}

export default class AssignRole {
  /** Replaces the member's role in the tenant; null leaves them without one. */
  async handle({ tenantId, userId, roleId }: AssignRoleInput) {
    try {
      await db.transaction(trx =>
        new KeepAManager().handle(trx, tenantId, async () => {
          await RoleAssignment.query({ client: trx }).where('user_id', userId).delete()

          if (roleId) await RoleAssignment.create({ userId, roleId }, { client: trx })
        }),
      )
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23503')
        throw new MemberNotFoundException()

      throw error
    }
  }
}

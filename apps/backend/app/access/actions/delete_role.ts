import db from '@adonisjs/lucid/services/db'
import Role from '#access/models/role'
import { inScope, type Scope } from '#access/scope'
import RoleInUseException from '#access/exceptions/role_in_use_exception'

export interface DeleteRoleInput {
  scope: Scope
  id: string
}

export default class DeleteRole {
  /**
   * The assignments' foreign key refuses to delete a role someone holds. The delete runs in a
   * savepoint so that refusal leaves an enclosing transaction (the test suite's) usable.
   */
  async handle({ scope, id }: DeleteRoleInput) {
    const role = await inScope(Role.query(), scope, 'roles').where('id', id).firstOrFail()

    try {
      await db.transaction(trx => role.useTransaction(trx).delete())
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23503')
        throw new RoleInUseException()

      throw error
    }
  }
}

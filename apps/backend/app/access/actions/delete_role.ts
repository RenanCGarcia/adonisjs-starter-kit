import db from '@adonisjs/lucid/services/db'
import Role from '#access/models/role'
import RoleInUseException from '#access/exceptions/role_in_use_exception'

export interface DeleteRoleInput {
  id: string
}

export default class DeleteRole {
  /**
   * The assignments' foreign key refuses to delete a role someone holds. The delete runs in a
   * savepoint so that refusal leaves an enclosing transaction (the test suite's) usable.
   */
  async handle({ id }: DeleteRoleInput) {
    const role = await Role.findOrFail(id)

    try {
      await db.transaction(trx => role.useTransaction(trx).delete())
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23503')
        throw new RoleInUseException()

      throw error
    }
  }
}

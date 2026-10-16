import { PERMISSIONS } from '#access/permissions'
import { inScope, type Scope } from '#access/scope'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import LastManagerException from '#access/exceptions/last_manager_exception'

const MANAGING = [PERMISSIONS.membersManage, PERMISSIONS.platformAdmin]

async function hasManager(trx: TransactionClientContract, scope: Scope) {
  const viaRole = trx
    .from('role_assignments')
    .join('roles', 'roles.id', 'role_assignments.role_id')
    .whereRaw('roles.permissions && ?::text[]', [MANAGING])
    .select(trx.raw('1'))

  const viaGrant = trx
    .from('permission_grants')
    .whereIn('permission', MANAGING)
    .select(trx.raw('1'))

  const rows: unknown[] = await inScope(viaRole, scope, 'role_assignments')
    .unionAll(inScope(viaGrant, scope, 'permission_grants'))
    .limit(1)

  return rows.length > 0
}

export class KeepAManager {
  /**
   * Runs `write` in `trx` and throws (rolling it back) when it leaves `scope` with no one able
   * to manage members while someone could before; a scope nobody manages yet can still be
   * set up. Writes to a scope are serialized, so two managers can't demote each other at once.
   */
  async handle<T>(trx: TransactionClientContract, scope: Scope, write: () => Promise<T>) {
    await trx.rawQuery('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
      `access:${scope ?? 'platform'}`,
    ])

    const before = await hasManager(trx, scope)
    const result = await write()

    if (before && !(await hasManager(trx, scope))) throw new LastManagerException()

    return result
  }
}

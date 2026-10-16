import db from '@adonisjs/lucid/services/db'
import { inScope, type Scope } from '#access/scope'
import { isPermission, type Permission } from '#access/permissions'

export interface GetPermissionsInput {
  userId: string
  scope: Scope
}

/** The permissions of the user's role in `scope` plus their grants there. */
export default class GetPermissions {
  async handle({ userId, scope }: GetPermissionsInput): Promise<Set<Permission>> {
    const fromRole = db
      .from('role_assignments')
      .join('roles', 'roles.id', 'role_assignments.role_id')
      .where('role_assignments.user_id', userId)
      .select(db.raw('unnest(roles.permissions) as permission'))

    const granted = db.from('permission_grants').where('user_id', userId).select('permission')

    const rows: { permission: string }[] = await inScope(
      fromRole,
      scope,
      'role_assignments',
    ).unionAll(inScope(granted, scope, 'permission_grants'))

    return new Set(rows.flatMap(({ permission }) => (isPermission(permission) ? [permission] : [])))
  }
}

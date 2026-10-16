import type User from '#users/models/user'
import { Bouncer } from '@adonisjs/bouncer'
import GetPermissions from '#access/queries/get_permissions'
import { currentScope, type Scope } from '#access/scope'
import { PERMISSIONS, type Permission } from '#access/permissions'

/**
 * Keyed by the User instance auth loads for each request: a scope resolves on its first
 * check, once per request, and a route that never checks runs no query.
 */
const resolved = new WeakMap<User, Map<Scope, Promise<Set<Permission>>>>()

function permissionsOf(user: User, scope: Scope) {
  let byScope = resolved.get(user)

  if (!byScope) {
    byScope = new Map()
    resolved.set(user, byScope)
  }

  let permissions = byScope.get(scope)

  if (!permissions) {
    permissions = new GetPermissions().handle({ userId: user.id, scope })
    byScope.set(scope, permissions)
  }

  return permissions
}

/**
 * The one authorization decision: `await bouncer.authorize(can, PERMISSIONS.rolesManage)`.
 * A platform-level platform.admin passes every check, wherever it runs.
 */
export const can = Bouncer.ability(async (user: User, permission: Permission) => {
  if ((await permissionsOf(user, null)).has(PERMISSIONS.platformAdmin)) return true

  return (await permissionsOf(user, currentScope())).has(permission)
})

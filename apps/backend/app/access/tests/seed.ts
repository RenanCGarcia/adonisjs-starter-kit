import User from '#users/models/user'
import Role from '#access/models/role'
import Tenant from '#tenancy/models/tenant'
import PermissionGrant from '#access/models/permission_grant'
import RoleAssignment from '#access/models/role_assignment'

let users = 0

/** A user who belongs to `tenants`. */
export async function member(...tenants: Tenant[]) {
  users += 1
  const user = await User.create({ email: `user${users}@example.com`, password: 'password123' })

  for (const tenant of tenants) await tenant.related('memberships').create({ userId: user.id })

  return user
}

/** A role in `tenant`, or a platform role for null. */
export function role(tenant: Tenant | null, name: string, permissions: string[]) {
  return Role.create({ tenantId: tenant?.id ?? null, name, permissions })
}

export function assign(user: User, role: Role) {
  return RoleAssignment.create({ userId: user.id, tenantId: role.tenantId, roleId: role.id })
}

export function grant(user: User, tenant: Tenant | null, permission: string) {
  return PermissionGrant.create({ userId: user.id, tenantId: tenant?.id ?? null, permission })
}

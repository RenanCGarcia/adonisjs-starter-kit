import User from '#users/models/user'
import Role from '#access/models/role'
import Tenant from '#tenancy/models/tenant'
import PermissionGrant from '#access/models/permission_grant'
import RoleAssignment from '#access/models/role_assignment'

let users = 0

function user() {
  users += 1

  return User.create({ email: `user${users}@example.com`, password: 'password123' })
}

function scoped(tenantId: string | null) {
  return {
    role: (name: string, permissions: string[]) => Role.create({ tenantId, name, permissions }),
    assign: (holder: User, role: Role) =>
      RoleAssignment.create({ tenantId, userId: holder.id, roleId: role.id }),
    grant: (holder: User, permission: string) =>
      PermissionGrant.create({ tenantId, userId: holder.id, permission }),
  }
}

/** Roles and grants at platform level, outside every tenant. */
export const platform = scoped(null)

/**
 * A tenant to act in, and the headers that select it. Specs other than tenant_isolation and
 * owner go through this, so "Access without tenancy" in docs/architecture.md only swaps
 * this file.
 */
export async function workspace(name = 'Acme') {
  const tenant = await Tenant.create({ name })

  return {
    ...scoped(tenant.id),
    tenant,
    headers: { 'X-Tenant-Id': tenant.id },
    async member() {
      const joined = await user()
      await tenant.related('memberships').create({ userId: joined.id })

      return joined
    },
  }
}

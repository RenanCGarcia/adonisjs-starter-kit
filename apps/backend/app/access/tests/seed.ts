import User from '#users/models/user'
import Role from '#access/models/role'
import Tenant from '#tenancy/models/tenant'
import PlatformAdmin from '#access/models/platform_admin'
import { runInTenant } from '#tenancy/tenant_context'
import PermissionGrant from '#access/models/permission_grant'
import RoleAssignment from '#access/models/role_assignment'

let users = 0

function user() {
  users += 1

  return User.create({ email: `user${users}@example.com`, password: 'password123' })
}

export function makePlatformAdmin(holder: User) {
  return PlatformAdmin.create({ userId: holder.id })
}

/** A tenant to act in, the headers that select it, and its roles, grants and members. */
export async function workspace(name = 'Acme') {
  const tenant = await Tenant.create({ name })
  const inside = <T>(fn: () => Promise<T>) => runInTenant(tenant.id, fn)

  return {
    tenant,
    inside,
    headers: { 'X-Tenant-Id': tenant.id },
    role: (roleName: string, permissions: string[]) =>
      inside(() => Role.create({ name: roleName, permissions })),
    assign: (holder: User, role: Role) =>
      inside(() => RoleAssignment.create({ userId: holder.id, roleId: role.id })),
    grant: (holder: User, permission: string) =>
      inside(() => PermissionGrant.create({ userId: holder.id, permission })),
    async member() {
      const joined = await user()
      await tenant.related('memberships').create({ userId: joined.id })

      return joined
    },
  }
}

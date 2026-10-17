export const PERMISSIONS = {
  rolesManage: 'roles.manage',
  membersManage: 'members.manage',
  platformAdmin: 'platform.admin',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

/**
 * What a role or grant may hold. platform.admin passes every check in every tenant, so it
 * comes only from a `platform_admins` row, never from a tenant's roles or grants.
 */
export const ASSIGNABLE_PERMISSIONS = ALL_PERMISSIONS.filter(
  permission => permission !== PERMISSIONS.platformAdmin,
)

const ASSIGNABLE = new Set<string>(ASSIGNABLE_PERMISSIONS)

/** Stored strings outlive the catalog: a permission removed from it must stop granting. */
export function isAssignable(value: string): value is Permission {
  return ASSIGNABLE.has(value)
}

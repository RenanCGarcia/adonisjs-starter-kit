export const PERMISSIONS = {
  rolesManage: 'roles.manage',
  membersManage: 'members.manage',
  platformAdmin: 'platform.admin',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

/**
 * What a role or grant may receive over HTTP. platform.admin passes every check, so it is
 * granted only by hand (REPL, seeder), never by a manager.
 */
export const ASSIGNABLE_PERMISSIONS = ALL_PERMISSIONS.filter(
  permission => permission !== PERMISSIONS.platformAdmin,
)

const KNOWN = new Set<string>(ALL_PERMISSIONS)

/** Stored strings outlive the catalog: a permission removed from it must stop granting. */
export function isPermission(value: string): value is Permission {
  return KNOWN.has(value)
}

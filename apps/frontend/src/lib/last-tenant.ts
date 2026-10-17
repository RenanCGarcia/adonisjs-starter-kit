const LAST_TENANT_KEY = 'lastTenantId'

/** A per-browser convenience: storage can be blocked or cleared, so every access tolerates failure. */
export const lastTenant = {
  get: () => {
    try {
      return localStorage.getItem(LAST_TENANT_KEY)
    } catch {
      return null
    }
  },
  set: (tenantId: string) => {
    try {
      localStorage.setItem(LAST_TENANT_KEY, tenantId)
    } catch {
      // Remembering the workspace is optional.
    }
  },
}

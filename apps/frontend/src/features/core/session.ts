import { z } from 'zod'
import { useStore } from 'zustand'
import { createPersistedStore } from '@/features/core/persisted-store'
import { preferences } from '@/features/core/preferences'

export const sessionStore = createPersistedStore(
  'starter:session',
  z.object({
    token: z.string().min(1).nullable(),
    /** Set while a platform admin acts as someone else: the admin's own token, to come back to. */
    impersonation: z
      .object({ adminToken: z.string().min(1) })
      .nullable()
      // State saved before impersonation existed holds `{ token }` alone; it stays signed in.
      .default(null),
  }),
  { token: null, impersonation: null },
)

export const session = {
  token: () => sessionStore.getState().token,
  isAuthenticated: () => sessionStore.getState().token !== null,
  isImpersonating: () => sessionStore.getState().impersonation !== null,
  signIn: (token: string) => sessionStore.setState({ token, impersonation: null }),
  /**
   * Drops the signed-out account's time zone so the next person on this browser never inherits
   * it (a stale zone, or one written to an account that had none). Keeps `locale`: the login
   * page reads it to stay in the last UI language, and no code path writes it to a different
   * account's profile anymore (signup and the sync-on-load fallback both detect the locale fresh
   * from the browser instead of reading this store).
   */
  signOut: () => {
    preferences.clearTimeZone()
    sessionStore.setState({ token: null, impersonation: null })
  },
  impersonate: (token: string) => {
    const adminToken = sessionStore.getState().token

    if (adminToken) sessionStore.setState({ token, impersonation: { adminToken } })
  },
  /** Back to the admin's own token; outside an impersonation, signs out. */
  stopImpersonating: () => {
    const { impersonation } = sessionStore.getState()

    sessionStore.setState({ token: impersonation?.adminToken ?? null, impersonation: null })
  },
}

export function useIsAuthenticated() {
  return useStore(sessionStore, state => state.token !== null)
}

export function useIsImpersonating() {
  return useStore(sessionStore, state => state.impersonation !== null)
}

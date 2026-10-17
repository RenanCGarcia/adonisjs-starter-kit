import { z } from 'zod'
import { useStore } from 'zustand'
import { createPersistedStore } from '@/features/core/persisted-store'

export const sessionStore = createPersistedStore(
  'starter:session',
  z.object({ token: z.string().min(1).nullable() }),
  { token: null },
)

export const session = {
  token: () => sessionStore.getState().token,
  isAuthenticated: () => sessionStore.getState().token !== null,
  signIn: (token: string) => sessionStore.setState({ token }),
  signOut: () => sessionStore.setState({ token: null }),
}

export function useIsAuthenticated() {
  return useStore(sessionStore, state => state.token !== null)
}

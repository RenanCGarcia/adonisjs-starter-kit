import { createRouter } from '@tanstack/react-router'
import { TuyauError } from '@tuyau/core/client'
import { adminMeQuery } from '@/features/admin/queries'
import { apiErrorCode } from '@/features/core/errors'
import { queryClient } from '@/features/core/query-client'
import { sessionStore } from '@/features/core/session'
import { tenantsQuery } from '@/features/tenancy/workspace'
import { routeTree } from '@/routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // TanStack Query owns caching; the router always asks it, and it answers from cache while fresh.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

// Route guards decide where a session may be, so a sign-in or sign-out from this tab or another
// reruns them. Another account's cached data never outlives its token.
sessionStore.subscribe((state, previous) => {
  if (state.token === previous.token) return

  queryClient.clear()
  void router.invalidate()
})

// A workspace suspended while a member has it open answers their next request 403. The workspace
// guard, rerun on a fresh tenant list, sends them to /workspace-suspended.
function leaveSuspendedWorkspace(error: Error | null) {
  if (!(error instanceof TuyauError) || error.status !== 403) return

  if (apiErrorCode(error) !== 'E_TENANT_SUSPENDED') return

  void queryClient
    .invalidateQueries({ queryKey: tenantsQuery().queryKey, refetchType: 'none' })
    .then(() => router.invalidate())
}

// Two-factor turned off in another tab answers the admin area's next request 403. Rerunning
// /admin/me, the way a suspended workspace reruns the tenant list, sends the admin to the prompt.
function recheckAdminTwoFactor(error: Error | null) {
  if (!(error instanceof TuyauError) || error.status !== 403) return

  if (apiErrorCode(error) !== 'E_TWO_FACTOR_REQUIRED') return

  void queryClient
    .invalidateQueries({ queryKey: adminMeQuery().queryKey, refetchType: 'none' })
    .then(() => router.invalidate())
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === 'updated' && event.action.type === 'error') {
    leaveSuspendedWorkspace(event.action.error)
    recheckAdminTwoFactor(event.action.error)
  }
})

queryClient.getMutationCache().subscribe(event => {
  if (event.type === 'updated' && event.action.type === 'error') {
    leaveSuspendedWorkspace(event.action.error)
    recheckAdminTwoFactor(event.action.error)
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

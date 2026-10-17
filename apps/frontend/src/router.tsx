import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/features/core/query-client'
import { sessionStore } from '@/features/core/session'
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

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

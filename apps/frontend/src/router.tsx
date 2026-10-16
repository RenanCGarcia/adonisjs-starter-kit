import { createRouter } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
import { routeTree } from '@/routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { auth },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

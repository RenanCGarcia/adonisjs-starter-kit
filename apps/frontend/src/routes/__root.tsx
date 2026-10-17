import { Toaster } from '@monorepo/ui/components/sonner'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { Auth } from '@/lib/auth'

interface RouterContext {
  auth: Auth
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
      <TanStackRouterDevtools />
    </>
  )
}

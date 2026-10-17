import { Button } from '@monorepo/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@monorepo/ui/components/empty'
import { Separator } from '@monorepo/ui/components/separator'
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { TuyauError } from '@tuyau/core/client'
import { CircleAlertIcon } from 'lucide-react'
import { AppMark } from '@/components/app-mark'
import { UserMenu } from '@/components/user-menu'
import { WorkspaceSwitcher } from '@/components/workspace-switcher'
import { api } from '@/lib/api'
import { errorMessage } from '@/lib/errors'

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({ to: '/login', search: returnTo(location.href) })
    }
  },
  loader: async ({ context, location }) => {
    const [[profile, profileError], [tenants, tenantsError]] = await Promise.all([
      api.profile.profile.show({}).safe(),
      api.tenants.tenants.index({}).safe(),
    ])

    // A token the API no longer accepts (expired, revoked elsewhere) is a signed-out session.
    if (profileError?.status === 401 || tenantsError?.status === 401) {
      context.auth.clearToken()
      throw redirect({ to: '/login', search: returnTo(location.href) })
    }

    if (profileError) throw profileError

    if (tenantsError) throw tenantsError

    return { user: profile.data, tenants: tenants.data }
  },
  component: AppLayout,
  errorComponent: AppError,
})

/** Sends the user back where they were after signing in; the home page is where sign-in lands anyway. */
function returnTo(href: string) {
  return href === '/' ? {} : { redirect: href }
}

function AppLayout() {
  const { user, tenants } = Route.useLoaderData()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background px-3 md:px-4">
        <AppMark />
        <Separator orientation="vertical" className="mx-1 my-3" />
        <WorkspaceSwitcher tenants={tenants} />
        <div className="ml-auto">
          <UserMenu user={user} />
        </div>
      </header>
      <Outlet />
    </div>
  )
}

function AppError({ error }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>
          <h1>Something went wrong</h1>
        </EmptyTitle>
        <EmptyDescription>
          {error instanceof TuyauError ? errorMessage(error) : 'The page failed to load.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => router.invalidate()}>Try again</Button>
      </EmptyContent>
    </Empty>
  )
}

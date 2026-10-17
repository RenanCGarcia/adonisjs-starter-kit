import { buttonVariants } from '@monorepo/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@monorepo/ui/components/empty'
import { createFileRoute, Link, notFound, Outlet } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'
import { useEffect } from 'react'
import { api, tenantHeaders } from '@/lib/api'
import { apiErrorCode } from '@/lib/errors'
import { lastTenant } from '@/lib/last-tenant'
import { reachableNav } from '@/lib/nav'

export const Route = createFileRoute('/_app/t/$tenantId')({
  beforeLoad: async ({ params }) => {
    const [data, error] = await api.access.myPermissions.show(tenantHeaders(params.tenantId)).safe()
    const code = error ? apiErrorCode(error) : null

    // Unknown ids and workspaces the user isn't in answer the same, so both read as "not found".
    if (code === 'E_TENANT_ACCESS_DENIED' || code === 'E_INVALID_TENANT_HEADER') throw notFound()

    if (error) throw error

    return { permissions: data.data.permissions }
  },
  component: TenantLayout,
  notFoundComponent: WorkspaceNotFound,
})

function TenantLayout() {
  const { tenantId } = Route.useParams()
  const { permissions } = Route.useRouteContext()

  useEffect(() => lastTenant.set(tenantId), [tenantId])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 md:flex-row md:gap-8 md:p-6">
      <nav
        aria-label="Workspace"
        className="-mx-1 flex shrink-0 gap-1 overflow-x-auto px-1 md:w-48 md:flex-col"
      >
        {reachableNav(permissions).map(item => (
          <Link
            key={item.to}
            to={item.to}
            params={{ tenantId }}
            activeOptions={{ exact: true }}
            className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
            activeProps={{ className: 'bg-muted text-foreground' }}
          >
            <item.icon data-icon="inline-start" />
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex min-w-0 flex-1 flex-col gap-6">
        <Outlet />
      </main>
    </div>
  )
}

function WorkspaceNotFound() {
  return (
    <Empty className="flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>
          <h1>Workspace not found</h1>
        </EmptyTitle>
        <EmptyDescription>
          This workspace doesn’t exist, or you’re not a member of it. If someone invited you, open
          the link in your invitation email.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/" className={buttonVariants()}>
          Go to my workspaces
        </Link>
      </EmptyContent>
    </Empty>
  )
}

import { Badge } from '@monorepo/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@monorepo/ui/components/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/page-header'
import { reachableNav } from '@/lib/nav'
import { permissionLabel } from '@/lib/permissions'
import { useTenant } from '@/lib/tenant'

export const Route = createFileRoute('/_app/t/$tenantId/')({
  component: Overview,
})

function Overview() {
  const { tenantId, tenant, permissions } = useTenant()
  const sections = reachableNav(permissions).filter(item => item.to !== '/t/$tenantId')

  return (
    <>
      <PageHeader title={tenant?.name ?? 'Workspace'} description="Workspace overview" />

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Your permissions</h2>
          </CardTitle>
          <CardDescription>
            {permissions.length > 0
              ? 'What your role and grants let you do here.'
              : 'You can see this workspace. Ask someone who manages members for more access.'}
          </CardDescription>
        </CardHeader>
        {permissions.length > 0 && (
          <CardContent>
            <ul aria-label="Your permissions" className="flex flex-wrap gap-2">
              {permissions.map(permission => (
                <li key={permission}>
                  <Badge variant="secondary">{permissionLabel(permission).label}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {sections.length > 0 && (
        <section aria-labelledby="sections-heading" className="flex flex-col gap-3">
          <h2 id="sections-heading" className="text-sm font-medium">
            Manage
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map(item => (
              <Link
                key={item.to}
                to={item.to}
                params={{ tenantId }}
                className="rounded-xl transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      <span className="flex items-center gap-2">
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </span>
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

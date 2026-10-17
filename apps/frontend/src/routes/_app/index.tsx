import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@monorepo/ui/components/card'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateWorkspaceForm } from '@/components/create-workspace-form'
import { lastTenant } from '@/lib/last-tenant'

export const Route = createFileRoute('/_app/')({
  loader: async ({ parentMatchPromise }) => {
    const { loaderData } = await parentMatchPromise
    const tenants = loaderData?.tenants ?? []
    const remembered = lastTenant.get()
    const target = tenants.find(tenant => tenant.id === remembered) ?? tenants[0]

    if (target) throw redirect({ to: '/t/$tenantId', params: { tenantId: target.id } })
  },
  component: Onboarding,
})

function Onboarding() {
  return (
    <main className="flex flex-1 items-start justify-center p-4 md:items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>Create your workspace</h1>
          </CardTitle>
          <CardDescription>
            A workspace holds your team: its members, their roles and invitations. Invited to an
            existing one? Open the link in your invitation email instead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWorkspaceForm />
        </CardContent>
      </Card>
    </main>
  )
}

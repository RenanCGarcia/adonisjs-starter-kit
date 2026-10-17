import { createFileRoute } from '@tanstack/react-router'
import { RequirePermission } from '@/components/require-permission'
import { PageHeader } from '@/components/page-header'

export const Route = createFileRoute('/_app/t/$tenantId/roles')({
  component: RolesPage,
})

function RolesPage() {
  return (
    <RequirePermission permission="roles.manage">
      <PageHeader title="Roles" description="What each role lets its members do." />
    </RequirePermission>
  )
}

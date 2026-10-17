import { createFileRoute } from '@tanstack/react-router'
import { RequirePermission } from '@/components/require-permission'
import { PageHeader } from '@/components/page-header'

export const Route = createFileRoute('/_app/t/$tenantId/members')({
  component: MembersPage,
})

function MembersPage() {
  return (
    <RequirePermission permission="members.manage">
      <PageHeader
        title="Members"
        description="People in this workspace, their role and extra permissions."
      />
    </RequirePermission>
  )
}

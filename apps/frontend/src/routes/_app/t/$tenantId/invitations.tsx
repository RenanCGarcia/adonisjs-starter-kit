import { createFileRoute } from '@tanstack/react-router'
import { RequirePermission } from '@/components/require-permission'
import { PageHeader } from '@/components/page-header'

export const Route = createFileRoute('/_app/t/$tenantId/invitations')({
  component: InvitationsPage,
})

function InvitationsPage() {
  return (
    <RequirePermission permission="members.manage">
      <PageHeader title="Invitations" description="People you invited who haven’t joined yet." />
    </RequirePermission>
  )
}

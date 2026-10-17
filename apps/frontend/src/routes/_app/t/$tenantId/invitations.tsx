import { Badge } from '@monorepo/ui/components/badge'
import { Button } from '@monorepo/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@monorepo/ui/components/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@monorepo/ui/components/table'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { MailIcon, MailPlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { InviteMemberDialog } from '@/components/invite-member-dialog'
import { PageHeader } from '@/components/page-header'
import { RequirePermission } from '@/components/require-permission'
import { api, tenantHeaders } from '@/lib/api'
import { errorMessage } from '@/lib/errors'
import { can } from '@/lib/permissions'

type Invitation = Awaited<ReturnType<typeof api.access.invitations.index>>['data'][number]

type Role = Awaited<ReturnType<typeof api.access.roles.index>>['data'][number]

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export const Route = createFileRoute('/_app/t/$tenantId/invitations')({
  loader: async ({ context, params }) => {
    if (!can(context.permissions, 'members.manage')) return null

    const [[invitationsData, invitationsError], [rolesData, rolesError]] = await Promise.all([
      api.access.invitations.index(tenantHeaders(params.tenantId)).safe(),
      api.access.roles.index(tenantHeaders(params.tenantId)).safe(),
    ])

    if (invitationsError) throw invitationsError

    if (rolesError) throw rolesError

    return { invitations: invitationsData.data, roles: rolesData.data }
  },
  component: InvitationsPage,
})

function roleName(roles: readonly Role[], roleId: string | null) {
  return roleId ? (roles.find(role => role.id === roleId)?.name ?? null) : null
}

/** The API always sets both dates; the nullable type here only reflects the column's general shape. */
function isExpired(expiresAt: string | null) {
  return expiresAt !== null && new Date(expiresAt).getTime() <= Date.now()
}

function formattedDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : '—'
}

function InvitationsPage() {
  const data = Route.useLoaderData()
  const { tenantId } = Route.useParams()
  const [inviting, setInviting] = useState(false)
  const [revoking, setRevoking] = useState<Invitation | null>(null)

  return (
    <RequirePermission permission="members.manage">
      {data && (
        <>
          <PageHeader
            title="Invitations"
            description="People you invited who haven’t joined yet."
            actions={
              <Button onClick={() => setInviting(true)}>
                <MailPlusIcon data-icon="inline-start" />
                Invite member
              </Button>
            }
          />

          {data.invitations.length === 0 ? (
            <div className="rounded-xl border border-dashed">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MailIcon />
                  </EmptyMedia>
                  <EmptyTitle>
                    <h2>No pending invitations</h2>
                  </EmptyTitle>
                  <EmptyDescription>
                    Invite someone by email to add them to this workspace.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setInviting(true)}>
                    <MailPlusIcon data-icon="inline-start" />
                    Invite your first member
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invitations.map(invitation => {
                  const expired = isExpired(invitation.expiresAt)
                  const name = roleName(data.roles, invitation.roleId)

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="break-all">{invitation.email}</TableCell>
                      <TableCell>
                        {name ? (
                          <Badge variant="secondary">{name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">No role</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-muted-foreground">
                          {formattedDate(invitation.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {formattedDate(invitation.expiresAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={expired ? 'destructive' : 'secondary'}>
                          {expired ? 'Expired' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Revoke invitation to ${invitation.email}`}
                          onClick={() => setRevoking(invitation)}
                        >
                          <Trash2Icon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {inviting && (
            <InviteMemberDialog
              invitations={data.invitations}
              roles={data.roles}
              tenantId={tenantId}
              open
              onOpenChange={setInviting}
            />
          )}

          {revoking && (
            <RevokeInvitationDialog
              key={revoking.id}
              invitation={revoking}
              tenantId={tenantId}
              open
              onOpenChange={open => !open && setRevoking(null)}
            />
          )}
        </>
      )}
    </RequirePermission>
  )
}

function RevokeInvitationDialog({
  invitation,
  tenantId,
  open,
  onOpenChange,
}: {
  invitation: Invitation
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onConfirm = async () => {
    setPending(true)

    const [, error] = await api.access.invitations
      .destroy({ params: { id: invitation.id }, ...tenantHeaders(tenantId) })
      .safe()

    setPending(false)

    if (error) {
      toast.error(errorMessage(error))

      return
    }

    onOpenChange(false)
    await router.invalidate()
    toast.success(`Invitation to ${invitation.email} revoked`)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Revoke the invitation to ${invitation.email}?`}
      description="They’ll need a new invitation to join this workspace."
      confirmLabel="Revoke invitation"
      pending={pending}
      onConfirm={onConfirm}
    />
  )
}

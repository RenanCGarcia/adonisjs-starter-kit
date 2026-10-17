import { Badge } from '@monorepo/ui/components/badge'
import { Button } from '@monorepo/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@monorepo/ui/components/table'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { KeyRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { MemberGrantsDialog } from '@/components/member-grants-dialog'
import { MemberRoleSelect } from '@/components/member-role-select'
import { PageHeader } from '@/components/page-header'
import { RequirePermission } from '@/components/require-permission'
import { UserAvatar } from '@/components/user-avatar'
import { api, tenantHeaders } from '@/lib/api'
import { can, permissionLabel } from '@/lib/permissions'

type Member = Awaited<ReturnType<typeof api.access.members.index>>['data']['members'][number]

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/t/$tenantId/members')({
  loader: async ({ context, params }) => {
    if (!can(context.permissions, 'members.manage')) return null

    const [[membersData, membersError], [rolesData, rolesError], [catalog, catalogError]] =
      await Promise.all([
        api.access.members.index(tenantHeaders(params.tenantId)).safe(),
        api.access.roles.index(tenantHeaders(params.tenantId)).safe(),
        api.access.permissionCatalog.show(tenantHeaders(params.tenantId)).safe(),
      ])

    if (membersError) throw membersError

    if (rolesError) throw rolesError

    if (catalogError) throw catalogError

    return { members: membersData.data.members, roles: rolesData.data, groups: catalog.data.groups }
  },
  component: MembersPage,
})

function MembersPage() {
  const data = Route.useLoaderData()
  const { tenantId } = Route.useParams()
  const { user } = appRoute.useLoaderData()
  const [editing, setEditing] = useState<Member | null>(null)

  return (
    <RequirePermission permission="members.manage">
      {data && (
        <>
          <PageHeader
            title="Members"
            description="People in this workspace, their role and extra permissions."
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Extra permissions</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.members.map(member => {
                const name = member.user.fullName ?? member.user.email

                return (
                  <TableRow key={member.user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar user={member.user} alt="" className="size-7" />
                        <div className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-1.5 truncate font-medium">
                            {name}
                            {member.user.id === user.id && <Badge variant="outline">You</Badge>}
                          </span>
                          <span className="truncate text-muted-foreground">
                            {member.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MemberRoleSelect
                        userId={member.user.id}
                        name={name}
                        roleId={member.roleId}
                        roles={data.roles}
                        tenantId={tenantId}
                      />
                    </TableCell>
                    <TableCell>
                      {member.permissions.length > 0 ? (
                        <ul className="flex flex-wrap gap-1">
                          {member.permissions.map(permission => (
                            <li key={permission}>
                              <Badge variant="secondary">{permissionLabel(permission).label}</Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit permissions for ${name}`}
                        onClick={() => setEditing(member)}
                      >
                        <KeyRoundIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {editing && (
            <MemberGrantsDialog
              key={editing.user.id}
              member={{
                userId: editing.user.id,
                name: editing.user.fullName ?? editing.user.email,
                permissions: editing.permissions,
              }}
              groups={data.groups}
              tenantId={tenantId}
              open
              onOpenChange={open => !open && setEditing(null)}
            />
          )}
        </>
      )}
    </RequirePermission>
  )
}

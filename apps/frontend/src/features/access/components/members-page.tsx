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
import { useSuspenseQueries } from '@tanstack/react-query'
import { KeyRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { MemberGrantsDialog } from '@/features/access/components/member-grants-dialog'
import { MemberRoleSelect } from '@/features/access/components/member-role-select'
import { RequirePermission } from '@/features/access/components/require-permission'
import { permissionLabel } from '@/features/access/permissions'
import { membersQuery, permissionCatalogQuery, rolesQuery } from '@/features/access/queries'
import type { api } from '@/features/core/api'
import { PageHeader } from '@/features/core/components/page-header'
import { useActiveTenant } from '@/features/tenancy/workspace'
import { UserAvatar } from '@/features/users/components/user-avatar'
import { profileQuery } from '@/features/users/profile'

type Member = Awaited<ReturnType<typeof api.access.members.index>>['data']['members'][number]

export function MembersPage() {
  return (
    <RequirePermission permission="members.manage">
      <Members />
    </RequirePermission>
  )
}

function Members() {
  const { id: tenantId } = useActiveTenant()

  const [{ data: members }, { data: roles }, { data: catalog }, { data: user }] =
    useSuspenseQueries({
      queries: [
        membersQuery(tenantId),
        rolesQuery(tenantId),
        permissionCatalogQuery(tenantId),
        profileQuery(),
      ],
    })

  const [editing, setEditing] = useState<Member | null>(null)

  return (
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
          {members.data.members.map(member => {
            const name = member.user.fullName ?? member.user.email

            return (
              <TableRow key={member.user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar user={member.user} alt="" className="size-7" />
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5 truncate font-medium">
                        {name}
                        {member.user.id === user.data.id && <Badge variant="outline">You</Badge>}
                      </span>
                      <span className="truncate text-muted-foreground">{member.user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <MemberRoleSelect
                    userId={member.user.id}
                    name={name}
                    roleId={member.roleId}
                    roles={roles.data}
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
          groups={catalog.data.groups}
          tenantId={tenantId}
          open
          onOpenChange={open => !open && setEditing(null)}
        />
      )}
    </>
  )
}

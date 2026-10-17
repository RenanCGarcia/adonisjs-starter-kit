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
import { useMutation, useQuery, useSuspenseQueries } from '@tanstack/react-query'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RequirePermission } from '@/features/access/components/require-permission'
import { RoleDialog } from '@/features/access/components/role-dialog'
import { can, permissionLabel, usePermissions } from '@/features/access/permissions'
import { membersQuery, permissionCatalogQuery, rolesQuery } from '@/features/access/queries'
import { queries, tenantHeaders } from '@/features/core/api'
import type { api } from '@/features/core/api'
import { ConfirmDialog } from '@/features/core/components/confirm-dialog'
import { PageHeader } from '@/features/core/components/page-header'
import { errorMessage } from '@/features/core/errors'
import { useActiveTenant } from '@/features/tenancy/workspace'

type Role = Awaited<ReturnType<typeof api.access.roles.index>>['data'][number]

export function RolesPage() {
  return (
    <RequirePermission permission="roles.manage">
      <Roles />
    </RequirePermission>
  )
}

function Roles() {
  const { id: tenantId } = useActiveTenant()
  // Counting a role's members needs the member list, which only members managers may read.
  const canSeeMembers = can(usePermissions(), 'members.manage')

  const [{ data: roles }, { data: catalog }] = useSuspenseQueries({
    queries: [rolesQuery(tenantId), permissionCatalogQuery(tenantId)],
  })

  const { data: members } = useQuery({ ...membersQuery(tenantId), enabled: canSeeMembers })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)

  return (
    <>
      <PageHeader
        title="Roles"
        description="What each role lets its members do."
        actions={
          <Button onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" />
            New role
          </Button>
        }
      />

      <RolesTable
        roles={roles.data}
        members={members?.data.members ?? null}
        onEdit={setEditing}
        onDelete={setDeleting}
      />

      {creating && (
        <RoleDialog
          groups={catalog.data.groups}
          tenantId={tenantId}
          open
          onOpenChange={setCreating}
        />
      )}

      {editing && (
        <RoleDialog
          key={editing.id}
          role={editing}
          groups={catalog.data.groups}
          tenantId={tenantId}
          open
          onOpenChange={open => !open && setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteRoleDialog
          key={deleting.id}
          role={deleting}
          tenantId={tenantId}
          open
          onOpenChange={open => !open && setDeleting(null)}
        />
      )}
    </>
  )
}

function RolesTable({
  roles,
  members,
  onEdit,
  onDelete,
}: {
  roles: readonly Role[]
  members: { roleId: string | null }[] | null
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}) {
  const memberCount = new Map<string, number>()

  for (const member of members ?? []) {
    if (member.roleId) memberCount.set(member.roleId, (memberCount.get(member.roleId) ?? 0) + 1)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map(role => (
          <TableRow key={role.id}>
            <TableCell>
              <span className="font-medium">{role.name}</span>
            </TableCell>
            <TableCell>
              {role.permissions.length > 0 ? (
                <ul className="flex flex-wrap gap-1">
                  {role.permissions.map(permission => (
                    <li key={permission}>
                      <Badge variant="secondary">{permissionLabel(permission).label}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">No permissions</span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">
                {members ? (memberCount.get(role.id) ?? 0) : '—'}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${role.name}`}
                  onClick={() => onEdit(role)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${role.name}`}
                  onClick={() => onDelete(role)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function DeleteRoleDialog({
  role,
  tenantId,
  open,
  onOpenChange,
}: {
  role: Role
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deleteRole = useMutation(
    queries.access.roles.destroy.mutationOptions({
      onSuccess: () => {
        onOpenChange(false)
        toast.success(`Role “${role.name}” deleted`)
      },
      onError: error => toast.error(errorMessage(error)),
    }),
  )

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete “${role.name}”?`}
      description="Members with this role keep their account, but lose what it granted. This can’t be undone."
      confirmLabel="Delete role"
      pending={deleteRole.isPending}
      onConfirm={() => deleteRole.mutate({ params: { id: role.id }, ...tenantHeaders(tenantId) })}
    />
  )
}

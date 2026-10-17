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
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { RequirePermission } from '@/components/require-permission'
import { RoleDialog } from '@/components/role-dialog'
import { api, tenantHeaders } from '@/lib/api'
import { errorMessage } from '@/lib/errors'
import { can, permissionLabel } from '@/lib/permissions'

type Role = Awaited<ReturnType<typeof api.access.roles.index>>['data'][number]

export const Route = createFileRoute('/_app/t/$tenantId/roles')({
  loader: async ({ context, params }) => {
    if (!can(context.permissions, 'roles.manage')) return null

    const [[roles, rolesError], [catalog, catalogError], membersResult] = await Promise.all([
      api.access.roles.index(tenantHeaders(params.tenantId)).safe(),
      api.access.permissionCatalog.show(tenantHeaders(params.tenantId)).safe(),
      // A members manager can also delete roles, but seeing "Owner" would need listing members; skip it otherwise.
      can(context.permissions, 'members.manage')
        ? api.access.members.index(tenantHeaders(params.tenantId)).safe()
        : Promise.resolve([null, null] as const),
    ])

    if (rolesError) throw rolesError

    if (catalogError) throw catalogError

    return {
      roles: roles.data,
      groups: catalog.data.groups,
      members: membersResult[0]?.data.members ?? null,
    }
  },
  component: RolesPage,
})

function RolesPage() {
  const data = Route.useLoaderData()
  const { tenantId } = Route.useParams()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)

  return (
    <RequirePermission permission="roles.manage">
      {data && (
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
            roles={data.roles}
            members={data.members}
            onEdit={setEditing}
            onDelete={setDeleting}
          />

          {creating && (
            <RoleDialog groups={data.groups} tenantId={tenantId} open onOpenChange={setCreating} />
          )}

          {editing && (
            <RoleDialog
              key={editing.id}
              role={editing}
              groups={data.groups}
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
      )}
    </RequirePermission>
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
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onConfirm = async () => {
    setPending(true)

    const [, error] = await api.access.roles
      .destroy({ params: { id: role.id }, ...tenantHeaders(tenantId) })
      .safe()

    setPending(false)

    if (error) {
      toast.error(errorMessage(error))

      return
    }

    onOpenChange(false)
    await router.invalidate()
    toast.success(`Role “${role.name}” deleted`)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete “${role.name}”?`}
      description="Members with this role keep their account, but lose what it granted. This can’t be undone."
      confirmLabel="Delete role"
      pending={pending}
      onConfirm={onConfirm}
    />
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@monorepo/ui/components/dialog'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PermissionPicker } from '@/features/access/components/permission-picker'
import type {
  AssignablePermission,
  Permission,
  PermissionGroup,
} from '@/features/access/permissions'
import { queries, tenantHeaders } from '@/features/core/api'
import { useAppForm, withFormErrors } from '@/features/core/form'

type Role = { id: string; name: string; permissions: Permission[] }

export function RoleDialog({
  role,
  groups,
  tenantId,
  open,
  onOpenChange,
}: {
  role?: Role
  groups: readonly PermissionGroup[]
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createRole = useMutation(queries.access.roles.store.mutationOptions())
  const updateRole = useMutation(queries.access.roles.update.mutationOptions())

  const form = useAppForm({
    defaultValues: {
      name: role?.name ?? '',
      // SAFETY: a role's stored permissions are always assignable; platform.admin never comes from one.
      permissions: (role?.permissions ?? []) as AssignablePermission[],
    },
    onSubmit: async ({ value, formApi }) => {
      const saved = await withFormErrors(
        formApi,
        role
          ? updateRole.mutateAsync({
              params: { id: role.id },
              body: value,
              ...tenantHeaders(tenantId),
            })
          : createRole.mutateAsync({ body: value, ...tenantHeaders(tenantId) }),
      )

      if (!saved) return

      onOpenChange(false)
      toast.success(role ? `Role “${value.name}” updated` : `Role “${value.name}” created`)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit role' : 'New role'}</DialogTitle>
          <DialogDescription>
            {role
              ? 'Rename this role or change what it grants its members.'
              : 'Give it a name and the permissions its members will have.'}
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form className="flex flex-col gap-4">
            <form.FormAlert />
            <form.AppField name="name">
              {field => (
                <field.TextField label="Role name" placeholder="Editor" required maxLength={255} />
              )}
            </form.AppField>
            <form.AppField name="permissions">
              {field => (
                <PermissionPicker
                  groups={groups}
                  value={new Set(field.state.value)}
                  onChange={next => field.handleChange([...next])}
                />
              )}
            </form.AppField>
            <DialogFooter>
              <form.SubmitButton>{role ? 'Save' : 'Create role'}</form.SubmitButton>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}

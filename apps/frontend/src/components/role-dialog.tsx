import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@monorepo/ui/components/dialog'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormAlert, PendingButton, TextField } from '@/components/form-fields'
import { PermissionPicker } from '@/components/permission-picker'
import { api, tenantHeaders } from '@/lib/api'
import { textValue, useFormSubmit } from '@/lib/form'
import type { AssignablePermission, Permission, PermissionGroup } from '@/lib/permissions'

type Role = { id: string; name: string; permissions: Permission[] }

/** Create when `role` is undefined, otherwise rename and re-permission it. */
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
  const router = useRouter()

  // SAFETY: a role's stored permissions are always assignable; platform.admin never comes from one.
  const [permissions, setPermissions] = useState(
    () => new Set(role?.permissions as AssignablePermission[] | undefined),
  )

  const { pending, errors, onSubmit } = useFormSubmit(async form => {
    const body = { name: textValue(form, 'name'), permissions: [...permissions] }

    const [, error] = await (
      role
        ? api.access.roles.update({ params: { id: role.id }, body, ...tenantHeaders(tenantId) })
        : api.access.roles.store({ body, ...tenantHeaders(tenantId) })
    ).safe()

    if (error) return error

    await router.invalidate()
    onOpenChange(false)
    toast.success(role ? `Role “${body.name}” updated` : `Role “${body.name}” created`)

    return null
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
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormAlert errors={errors} />
          <TextField
            name="name"
            label="Role name"
            defaultValue={role?.name}
            placeholder="Editor"
            required
            maxLength={255}
            errors={errors}
          />
          <PermissionPicker groups={groups} value={permissions} onChange={setPermissions} />
          <DialogFooter>
            <PendingButton type="submit" pending={pending}>
              {role ? 'Save' : 'Create role'}
            </PendingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { FormAlert, PendingButton } from '@/components/form-fields'
import { PermissionPicker } from '@/components/permission-picker'
import { api, tenantHeaders } from '@/lib/api'
import { useFormSubmit } from '@/lib/form'
import type { AssignablePermission, Permission, PermissionGroup } from '@/lib/permissions'

type Member = { userId: string; name: string; permissions: Permission[] }

/** Permissions granted to one member directly, on top of whatever their role gives them. */
export function MemberGrantsDialog({
  member,
  groups,
  tenantId,
  open,
  onOpenChange,
}: {
  member: Member
  groups: readonly PermissionGroup[]
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  // SAFETY: a member's direct grants are always assignable; platform.admin never comes from one.
  const seed = () => new Set(member.permissions as AssignablePermission[])
  const [permissions, setPermissions] = useState(seed)

  const { pending, errors, onSubmit } = useFormSubmit(async () => {
    const [, error] = await api.access.memberPermissions
      .update({
        params: { userId: member.userId },
        body: { permissions: [...permissions] },
        ...tenantHeaders(tenantId),
      })
      .safe()

    if (error) return error

    await router.invalidate()
    onOpenChange(false)
    toast.success(`Permissions updated for ${member.name}`)

    return null
  })

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (next) setPermissions(seed())
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit permissions</DialogTitle>
          <DialogDescription>
            Extra permissions for {member.name}, on top of what their role grants.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormAlert errors={errors} />
          <PermissionPicker groups={groups} value={permissions} onChange={setPermissions} />
          <DialogFooter>
            <PendingButton type="submit" pending={pending}>
              Save
            </PendingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

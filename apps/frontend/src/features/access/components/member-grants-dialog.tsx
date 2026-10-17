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

type Member = { userId: string; name: string; permissions: Permission[] }

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
  const updateGrants = useMutation(queries.access.memberPermissions.update.mutationOptions())

  const form = useAppForm({
    // SAFETY: a member's direct grants are always assignable; platform.admin never comes from one.
    defaultValues: { permissions: member.permissions as AssignablePermission[] },
    onSubmit: async ({ value, formApi }) => {
      const updated = await withFormErrors(
        formApi,
        updateGrants.mutateAsync({
          params: { userId: member.userId },
          body: value,
          ...tenantHeaders(tenantId),
        }),
      )

      if (!updated) return

      onOpenChange(false)
      toast.success(`Permissions updated for ${member.name}`)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit permissions</DialogTitle>
          <DialogDescription>
            Extra permissions for {member.name}, on top of what their role grants.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form className="flex flex-col gap-4">
            <form.FormAlert />
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
              <form.SubmitButton>Save</form.SubmitButton>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@monorepo/ui/components/dialog'
import { Field, FieldLabel } from '@monorepo/ui/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@monorepo/ui/components/select'
import { useRouter } from '@tanstack/react-router'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { FormAlert, PendingButton, TextField } from '@/components/form-fields'
import { api, tenantHeaders } from '@/lib/api'
import { textValue, useFormSubmit } from '@/lib/form'

type Role = { id: string; name: string }

type Invitation = { email: string }

/** No role is a real, selectable state, so it needs its own value distinct from an empty string. */
const NO_ROLE = 'none'

/** Invites someone by email; inviting an email that's already pending re-sends it instead of failing. */
export function InviteMemberDialog({
  invitations,
  roles,
  tenantId,
  open,
  onOpenChange,
}: {
  invitations: readonly Invitation[]
  roles: readonly Role[]
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const roleFieldId = useId()
  const [roleId, setRoleId] = useState<string>(NO_ROLE)

  const { pending, errors, onSubmit } = useFormSubmit(async form => {
    const email = textValue(form, 'email').trim().toLowerCase()
    const alreadyInvited = invitations.some(invitation => invitation.email === email)

    const [, error] = await api.access.invitations
      .store({
        body: { email, roleId: roleId === NO_ROLE ? null : roleId },
        ...tenantHeaders(tenantId),
      })
      .safe()

    if (error) return error

    await router.invalidate()
    onOpenChange(false)
    toast.success(alreadyInvited ? `Invitation to ${email} resent` : `Invitation sent to ${email}`)

    return null
  })

  const items = [
    { value: NO_ROLE, label: 'No role' },
    ...roles.map(role => ({ value: role.id, label: role.name })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            They’ll get an email with a link to join this workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormAlert errors={errors} />
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            errors={errors}
          />
          <Field>
            <FieldLabel htmlFor={roleFieldId}>Role</FieldLabel>
            <Select
              items={items}
              value={roleId}
              onValueChange={value => value && setRoleId(value)}
              disabled={pending}
            >
              <SelectTrigger id={roleFieldId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <PendingButton type="submit" pending={pending}>
              Send invitation
            </PendingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

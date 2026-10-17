import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@monorepo/ui/components/select'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, tenantHeaders } from '@/lib/api'
import { errorMessage } from '@/lib/errors'

type Role = { id: string; name: string }

/** No role is a real, selectable state, so it needs its own value distinct from an empty string. */
const NO_ROLE = 'none'

/**
 * Bound to the server's `roleId`, not local state: a failed change leaves it showing the role
 * the member still has, with no separate revert step.
 */
export function MemberRoleSelect({
  userId,
  name,
  roleId,
  roles,
  tenantId,
}: {
  userId: string
  name: string
  roleId: string | null
  roles: readonly Role[]
  tenantId: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const onValueChange = async (value: string | null) => {
    if (value === null) return

    const nextRoleId = value === NO_ROLE ? null : value

    setPending(true)

    const [, error] = await api.access.memberRoles
      .update({ params: { userId }, body: { roleId: nextRoleId }, ...tenantHeaders(tenantId) })
      .safe()

    setPending(false)

    if (error) {
      toast.error(errorMessage(error))

      return
    }

    await router.invalidate()
    toast.success(`Role updated for ${name}`)
  }

  const items = [
    { value: NO_ROLE, label: 'No role' },
    ...roles.map(role => ({ value: role.id, label: role.name })),
  ]

  return (
    <Select
      items={items}
      value={roleId ?? NO_ROLE}
      onValueChange={onValueChange}
      disabled={pending}
    >
      <SelectTrigger aria-label={`Role for ${name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_ROLE}>No role</SelectItem>
        {roles.map(role => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

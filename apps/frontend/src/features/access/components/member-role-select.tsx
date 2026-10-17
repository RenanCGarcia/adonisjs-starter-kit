import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@monorepo/ui/components/select'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queries, tenantHeaders } from '@/features/core/api'
import { errorMessage } from '@/features/core/errors'
import { t } from '@/features/core/i18n'

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
  const updateRole = useMutation(
    queries.access.memberRoles.update.mutationOptions({
      onSuccess: () => toast.success(t('access.memberRoleSelect.roleUpdated', { name })),
      onError: error => toast.error(errorMessage(error)),
    }),
  )

  const onValueChange = (value: string | null) => {
    if (value === null) return

    updateRole.mutate({
      params: { userId },
      body: { roleId: value === NO_ROLE ? null : value },
      ...tenantHeaders(tenantId),
    })
  }

  const items = [
    { value: NO_ROLE, label: t('access.memberRoleSelect.noRole') },
    ...roles.map(role => ({ value: role.id, label: role.name })),
  ]

  return (
    <Select
      items={items}
      value={roleId ?? NO_ROLE}
      onValueChange={onValueChange}
      disabled={updateRole.isPending}
    >
      <SelectTrigger aria-label={t('access.memberRoleSelect.roleFor', { name })}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_ROLE}>{t('access.memberRoleSelect.noRole')}</SelectItem>
        {roles.map(role => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

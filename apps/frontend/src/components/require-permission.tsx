import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@monorepo/ui/components/empty'
import { LockIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { can, permissionLabel } from '@/lib/permissions'
import type { Permission } from '@/lib/permissions'
import { useTenant } from '@/lib/tenant'

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: ReactNode
}) {
  const { permissions } = useTenant()

  if (can(permissions, permission)) return children

  return (
    <div className="rounded-xl border border-dashed">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockIcon />
          </EmptyMedia>
          <EmptyTitle>
            <h1>You don’t have access</h1>
          </EmptyTitle>
          <EmptyDescription>
            This page needs the “{permissionLabel(permission).label}” permission. Ask someone who
            manages members in this workspace to grant it.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

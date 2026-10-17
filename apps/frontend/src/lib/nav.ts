import type { LucideIcon } from 'lucide-react'
import { LayoutDashboardIcon, MailIcon, ShieldIcon, UsersIcon } from 'lucide-react'
import { can } from '@/lib/permissions'
import type { Permission } from '@/lib/permissions'
import type { FileRoutesByTo } from '@/routeTree.gen'

type TenantPath = Extract<keyof FileRoutesByTo, `/t/$tenantId${string}`>

export type NavItem = {
  to: TenantPath
  label: string
  description: string
  icon: LucideIcon
  requires: Permission | null
}

/** The workspace sections, in sidebar order. The sidebar and the overview cards both render from it. */
export const TENANT_NAV: readonly NavItem[] = [
  {
    to: '/t/$tenantId',
    label: 'Overview',
    description: 'This workspace at a glance.',
    icon: LayoutDashboardIcon,
    requires: null,
  },
  {
    to: '/t/$tenantId/members',
    label: 'Members',
    description: 'See who belongs to the workspace, change their role and extra permissions.',
    icon: UsersIcon,
    requires: 'members.manage',
  },
  {
    to: '/t/$tenantId/invitations',
    label: 'Invitations',
    description: 'Invite people by email and revoke pending invitations.',
    icon: MailIcon,
    requires: 'members.manage',
  },
  {
    to: '/t/$tenantId/roles',
    label: 'Roles',
    description: 'Define roles and the permissions each one grants.',
    icon: ShieldIcon,
    requires: 'roles.manage',
  },
]

export function reachableNav(permissions: readonly Permission[]) {
  return TENANT_NAV.filter(item => item.requires === null || can(permissions, item.requires))
}

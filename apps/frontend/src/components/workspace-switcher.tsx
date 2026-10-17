import { Button } from '@monorepo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@monorepo/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@monorepo/ui/components/dropdown-menu'
import type { Data } from '@monorepo/backend/data'
import { Link, useParams } from '@tanstack/react-router'
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { CreateWorkspaceForm } from '@/components/create-workspace-form'
import { lastTenant } from '@/lib/last-tenant'

function WorkspaceInitial({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary text-xs font-semibold text-primary-foreground uppercase"
    >
      {name.trim().charAt(0)}
    </span>
  )
}

export function WorkspaceSwitcher({ tenants }: { tenants: Data.Tenancy.Tenant[] }) {
  const { tenantId } = useParams({ strict: false })
  const [creating, setCreating] = useState(false)
  // Outside a workspace page (the profile), the switcher keeps showing the workspace the user came from.
  const currentId = tenantId ?? lastTenant.get()
  const current = tenants.find(tenant => tenant.id === currentId)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="max-w-56 min-w-0" />}>
          {current && <WorkspaceInitial name={current.name} />}
          <span className="sr-only">Workspace: </span>
          <span className="truncate">{current?.name ?? 'Select a workspace'}</span>
          <ChevronsUpDownIcon data-icon="inline-end" className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          {tenants.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {tenants.map(tenant => (
                <DropdownMenuItem
                  key={tenant.id}
                  render={<Link to="/t/$tenantId" params={{ tenantId: tenant.id }} />}
                >
                  <WorkspaceInitial name={tenant.name} />
                  <span className="truncate">{tenant.name}</span>
                  {tenant.id === current?.id && <CheckIcon className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
          {tenants.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={() => setCreating(true)}>
            <PlusIcon />
            New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>
              You’ll be its owner, with every permission. You can invite people next.
            </DialogDescription>
          </DialogHeader>
          <CreateWorkspaceForm onCreated={() => setCreating(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

import { FieldGroup } from '@monorepo/ui/components/field'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FormAlert, PendingButton, TextField } from '@/components/form-fields'
import { api } from '@/lib/api'
import { textValue, useFormSubmit } from '@/lib/form'
import { lastTenant } from '@/lib/last-tenant'

/** Creates a workspace and opens it. */
export function CreateWorkspaceForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter()
  const navigate = useNavigate()

  const { pending, errors, onSubmit } = useFormSubmit(async form => {
    const [data, error] = await api.tenants.tenants
      .store({ body: { name: textValue(form, 'name') } })
      .safe()

    if (error) return error

    const tenant = data.data

    // Remembered before reloading, so the index route's redirect also lands on the new workspace.
    lastTenant.set(tenant.id)
    await router.invalidate()
    onCreated?.()
    await navigate({ to: '/t/$tenantId', params: { tenantId: tenant.id } })
    toast.success(`Workspace “${tenant.name}” created`)

    return null
  })

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <FormAlert errors={errors} />
        <TextField
          name="name"
          label="Workspace name"
          placeholder="Acme Inc."
          autoComplete="organization"
          required
          maxLength={255}
          errors={errors}
        />
        <PendingButton type="submit" pending={pending}>
          Create workspace
        </PendingButton>
      </FieldGroup>
    </form>
  )
}

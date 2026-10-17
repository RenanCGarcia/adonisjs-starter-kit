import { FieldGroup } from '@monorepo/ui/components/field'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { queries } from '@/features/core/api'
import { useAppForm, withFormErrors } from '@/features/core/form'
import { selectWorkspace } from '@/features/tenancy/workspace'

export function CreateWorkspaceForm({ onCreated }: { onCreated?: () => void }) {
  const navigate = useNavigate()
  const createTenant = useMutation(queries.tenants.tenants.store.mutationOptions())

  const form = useAppForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value, formApi }) => {
      const created = await withFormErrors(formApi, createTenant.mutateAsync({ body: value }))

      if (!created) return

      selectWorkspace(created.data.id)
      onCreated?.()
      await navigate({ to: '/' })
      toast.success(`Workspace “${created.data.name}” created`)
    },
  })

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.FormAlert />
          <form.AppField name="name">
            {field => (
              <field.TextField
                label="Workspace name"
                placeholder="Acme Inc."
                autoComplete="organization"
                required
                maxLength={255}
              />
            )}
          </form.AppField>
          <form.SubmitButton>Create workspace</form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  )
}

import { FieldGroup } from '@monorepo/ui/components/field'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/components/auth-card'
import { queries } from '@/features/core/api'
import { formErrors } from '@/features/core/errors'
import { useAppForm, withFormErrors } from '@/features/core/form'
import { session } from '@/features/core/session'

const route = getRouteApi('/login')

/** Signing in reruns the route guards, which send the user on to `?redirect=`. */
export function LoginPage() {
  const { redirect: redirectTo } = route.useSearch()
  const createToken = useMutation(queries.auth.accessTokens.store.mutationOptions())

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value, formApi }) => {
      const created = await withFormErrors(
        formApi,
        createToken.mutateAsync({ body: value }),
        error =>
          // The API answers a wrong email or password with a 400 that names neither.
          error.status === 400
            ? { fields: {}, form: 'Invalid email or password.' }
            : formErrors(error),
      )

      if (created) session.signIn(created.data.token)
    },
  })

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in to your account."
      footer={
        <p className="text-xs text-muted-foreground">
          No account yet?{' '}
          <Link
            to="/signup"
            search={{ redirect: redirectTo }}
            className="text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.FormAlert />
            <form.AppField name="email">
              {field => (
                <field.TextField label="Email" type="email" autoComplete="email" required />
              )}
            </form.AppField>
            <form.AppField name="password">
              {field => (
                <field.TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              )}
            </form.AppField>
            <form.SubmitButton size="lg">Sign in</form.SubmitButton>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    </AuthCard>
  )
}

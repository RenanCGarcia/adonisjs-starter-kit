import { FieldGroup } from '@monorepo/ui/components/field'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/components/auth-card'
import { queries } from '@/features/core/api'
import { useAppForm, withFormErrors } from '@/features/core/form'
import { session } from '@/features/core/session'

const route = getRouteApi('/signup')

/** Signing up reruns the route guards, which send the user on to `?redirect=`. */
export function SignupPage() {
  const { redirect: redirectTo } = route.useSearch()
  const createAccount = useMutation(queries.auth.newAccount.store.mutationOptions())

  const form = useAppForm({
    defaultValues: { fullName: '', email: '', password: '', passwordConfirmation: '' },
    onSubmit: async ({ value, formApi }) => {
      const created = await withFormErrors(
        formApi,
        createAccount.mutateAsync({ body: { ...value, fullName: value.fullName.trim() || null } }),
      )

      if (created) session.signIn(created.data.token)
    },
  })

  return (
    <AuthCard
      title="Create your account"
      description="Sign up to create a workspace or join one you were invited to."
      footer={
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            search={{ redirect: redirectTo }}
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.FormAlert />
            <form.AppField name="fullName">
              {field => <field.TextField label="Full name" autoComplete="name" />}
            </form.AppField>
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
                  autoComplete="new-password"
                  description="8 to 32 characters."
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="passwordConfirmation">
              {field => (
                <field.TextField
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              )}
            </form.AppField>
            <form.SubmitButton size="lg">Create account</form.SubmitButton>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    </AuthCard>
  )
}

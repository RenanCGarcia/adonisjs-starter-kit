import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { FieldGroup } from '@monorepo/ui/components/field'
import { AuthCard } from '@/components/auth-card'
import { FormAlert, PendingButton, TextField } from '@/components/form-fields'
import { api } from '@/lib/api'
import { textValue, useFormSubmit } from '@/lib/form'
import { validateRedirectSearch } from '@/lib/redirect'

export const Route = createFileRoute('/signup')({
  validateSearch: validateRedirectSearch,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) throw redirect({ to: search.redirect ?? '/' })
  },
  component: SignupComponent,
})

function SignupComponent() {
  const { auth } = Route.useRouteContext()
  const { redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()

  const { pending, errors, onSubmit } = useFormSubmit(async form => {
    const [data, error] = await api.auth.newAccount
      .store({
        body: {
          fullName: textValue(form, 'fullName').trim() || null,
          email: textValue(form, 'email'),
          password: textValue(form, 'password'),
          passwordConfirmation: textValue(form, 'passwordConfirmation'),
        },
      })
      .safe()

    if (error) return error

    auth.setToken(data.data.token)
    await navigate({ to: redirectTo ?? '/' })

    return null
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
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <FormAlert errors={errors} />
          <TextField name="fullName" label="Full name" autoComplete="name" errors={errors} />
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            errors={errors}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            description="8 to 32 characters."
            required
            errors={errors}
          />
          <TextField
            name="passwordConfirmation"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            errors={errors}
          />
          <PendingButton type="submit" size="lg" pending={pending}>
            Create account
          </PendingButton>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

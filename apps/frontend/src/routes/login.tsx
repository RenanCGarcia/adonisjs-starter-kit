import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { FieldGroup } from '@monorepo/ui/components/field'
import { AuthCard } from '@/components/auth-card'
import { FormAlert, PendingButton, TextField } from '@/components/form-fields'
import { api } from '@/lib/api'
import { textValue, useFormSubmit } from '@/lib/form'
import { validateRedirectSearch } from '@/lib/redirect'

export const Route = createFileRoute('/login')({
  validateSearch: validateRedirectSearch,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) throw redirect({ to: search.redirect ?? '/' })
  },
  component: LoginComponent,
})

function LoginComponent() {
  const { auth } = Route.useRouteContext()
  const { redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()

  const { pending, errors, onSubmit } = useFormSubmit(async form => {
    const [data, error] = await api.auth.accessTokens
      .store({ body: { email: textValue(form, 'email'), password: textValue(form, 'password') } })
      .safe()

    // The API answers a wrong email or password with a 400 that names neither.
    if (error?.status === 400) return 'Invalid email or password.'

    if (error) return error

    auth.setToken(data.data.token)
    await navigate({ to: redirectTo ?? '/' })

    return null
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
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <FormAlert errors={errors} />
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
            autoComplete="current-password"
            required
            errors={errors}
          />
          <PendingButton type="submit" size="lg" pending={pending}>
            Sign in
          </PendingButton>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}

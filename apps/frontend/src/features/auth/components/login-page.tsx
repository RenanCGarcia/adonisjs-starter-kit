import { FieldGroup } from '@monorepo/ui/components/field'
import { useMutation } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/components/auth-card'
import { queries } from '@/features/core/api'
import { useAppForm, withFormErrors } from '@/features/core/form'
import { t } from '@/features/core/i18n'
import { session } from '@/features/core/session'

const route = getRouteApi('/login')

/** Signing in reruns the route guards, which send the user on to `?redirect=`. */
export function LoginPage() {
  const { redirect: redirectTo } = route.useSearch()
  const createToken = useMutation(queries.auth.accessTokens.store.mutationOptions())

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value, formApi }) => {
      const created = await withFormErrors(formApi, createToken.mutateAsync({ body: value }))

      if (created) session.signIn(created.data.token)
    },
  })

  return (
    <AuthCard
      title={t('auth.loginPage.title')}
      description={t('auth.loginPage.description')}
      footer={
        <p className="text-xs text-muted-foreground">
          {t('auth.loginPage.noAccount')}{' '}
          <Link
            to="/signup"
            search={{ redirect: redirectTo }}
            className="text-foreground underline underline-offset-4"
          >
            {t('auth.loginPage.createOne')}
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
                <field.TextField
                  label={t('auth.loginPage.email')}
                  type="email"
                  autoComplete="email"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {field => (
                <field.TextField
                  label={t('auth.loginPage.password')}
                  type="password"
                  autoComplete="current-password"
                  required
                />
              )}
            </form.AppField>
            <form.SubmitButton size="lg">{t('auth.loginPage.submit')}</form.SubmitButton>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    </AuthCard>
  )
}

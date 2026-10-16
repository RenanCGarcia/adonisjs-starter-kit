import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '@/lib/api'

type LoginSearch = { redirect?: string }

export const Route = createFileRoute('/login')({
  validateSearch: (search): LoginSearch => ({
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- the URL is the parse boundary; a single optional string needs no schema.
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginComponent,
})

function LoginComponent() {
  const { auth } = Route.useRouteContext()
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    const [data, err] = await api.auth.accessTokens
      .store({
        // SAFETY: both inputs are required text fields, so the form holds a string for each.
        body: {
          email: form.get('email') as string,
          password: form.get('password') as string,
        },
      })
      .safe()

    if (err) {
      setError('Invalid credentials')

      return
    }

    auth.setToken(data.data.token)
    await navigate({ to: redirect ?? '/profile' })
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-80 gap-2">
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}

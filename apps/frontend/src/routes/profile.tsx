import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { api } from '@/lib/api'

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  loader: async () => {
    const { data } = await api.profile.profile.show({})
    return { user: data }
  },
  component: ProfileComponent,
})

function ProfileComponent() {
  const { user } = Route.useLoaderData()
  const { auth } = Route.useRouteContext()
  const router = useRouter()

  const handleLogout = async () => {
    await api.profile.accessTokens.destroy({})
    auth.clearToken()
    await router.navigate({ to: '/login' })
  }

  return (
    <div>
      <h1>{user.fullName ?? user.email}</h1>
      <p>{user.email}</p>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

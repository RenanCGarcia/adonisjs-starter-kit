import { buttonVariants } from '@monorepo/ui/components/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthCard } from '@/components/auth-card'
import { PendingButton } from '@/components/form-fields'
import { api } from '@/lib/api'
import { apiErrorCode, errorMessage } from '@/lib/errors'

export const Route = createFileRoute('/invitations/$token')({
  loader: async ({ context }) => {
    if (!context.auth.isAuthenticated()) return { user: null }

    const [profile, error] = await api.profile.profile.show({}).safe()

    // A token the API no longer accepts is a signed-out visitor; let them sign in again from here.
    if (error?.status === 401) {
      context.auth.clearToken()

      return { user: null }
    }

    if (error) throw error

    return { user: profile.data }
  },
  component: InvitationAcceptPage,
})

type Status = 'idle' | 'not-found' | 'mismatch'

function InvitationAcceptPage() {
  const { token } = Route.useParams()
  const { user } = Route.useLoaderData()
  const { auth } = Route.useRouteContext()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('idle')
  const [pending, setPending] = useState(false)
  const redirectSearch = { redirect: `/invitations/${token}` }

  if (!user) {
    return (
      <AuthCard
        title="You’re invited"
        description="Sign in or create an account to accept this invitation."
      >
        <div className="flex flex-col gap-2">
          <Link to="/login" search={redirectSearch} className={buttonVariants({ size: 'lg' })}>
            Sign in
          </Link>
          <Link
            to="/signup"
            search={redirectSearch}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Create account
          </Link>
        </div>
      </AuthCard>
    )
  }

  if (status === 'not-found') {
    return (
      <AuthCard
        title="Invitation not found"
        description="This invitation doesn’t exist or has expired."
      >
        <Link to="/" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
          Go home
        </Link>
      </AuthCard>
    )
  }

  if (status === 'mismatch') {
    const signInWithAnotherAccount = async () => {
      auth.clearToken()
      await navigate({ to: '/login', search: redirectSearch })
    }

    return (
      <AuthCard
        title="Wrong account"
        description={`You’re signed in as ${user.email}, but this invitation was sent to a different email address.`}
      >
        <PendingButton
          size="lg"
          className="w-full"
          pending={false}
          onClick={signInWithAnotherAccount}
        >
          Sign in with another account
        </PendingButton>
      </AuthCard>
    )
  }

  const accept = async () => {
    setPending(true)

    const [tenant, error] = await api.invitationAccept.store({ body: { token } }).safe()

    setPending(false)

    if (error) {
      const code = apiErrorCode(error)

      if (code === 'E_INVITATION_NOT_FOUND') setStatus('not-found')
      else if (code === 'E_INVITATION_EMAIL_MISMATCH') setStatus('mismatch')
      else toast.error(errorMessage(error))

      return
    }

    toast.success(`You’ve joined “${tenant.data.name}”`)
    await navigate({ to: '/t/$tenantId', params: { tenantId: tenant.data.id } })
  }

  return (
    <AuthCard title="Accept invitation" description={`Signed in as ${user.email}.`}>
      <PendingButton size="lg" className="w-full" pending={pending} onClick={accept}>
        Accept invitation
      </PendingButton>
    </AuthCard>
  )
}

import { buttonVariants } from '@monorepo/ui/components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { AuthCard } from '@/features/auth/components/auth-card'
import { queries } from '@/features/core/api'
import { PendingButton } from '@/features/core/components/pending-button'
import { apiErrorCode, errorMessage } from '@/features/core/errors'
import { session, useIsAuthenticated } from '@/features/core/session'
import { selectWorkspace } from '@/features/tenancy/workspace'
import { profileQuery } from '@/features/users/profile'

const route = getRouteApi('/invitations/$token')

export function AcceptInvitationPage() {
  const { token } = route.useParams()
  const isAuthenticated = useIsAuthenticated()
  // A token the API no longer accepts signs the visitor out, who can then sign in again from here.
  const profile = useQuery({ ...profileQuery(), enabled: isAuthenticated })
  const navigate = useNavigate()
  const redirectSearch = { redirect: `/invitations/${token}` }

  const accept = useMutation(
    queries.invitationAccept.store.mutationOptions({
      onSuccess: async ({ data: tenant }) => {
        selectWorkspace(tenant.id)
        toast.success(`You’ve joined “${tenant.name}”`)
        await navigate({ to: '/' })
      },
      onError: error => {
        if (apiErrorCode(error) === null) toast.error(errorMessage(error))
      },
    }),
  )

  if (!isAuthenticated) {
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

  if (profile.error) {
    return (
      <AuthCard title="Something went wrong" description={errorMessage(profile.error)}>
        <PendingButton
          size="lg"
          className="w-full"
          pending={profile.isFetching}
          onClick={() => profile.refetch()}
        >
          Try again
        </PendingButton>
      </AuthCard>
    )
  }

  const user = profile.data?.data

  if (!user) return null

  const failure = accept.error ? apiErrorCode(accept.error) : null

  if (failure === 'E_INVITATION_NOT_FOUND') {
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

  if (failure === 'E_INVITATION_EMAIL_MISMATCH') {
    const signInWithAnotherAccount = async () => {
      session.signOut()
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

  return (
    <AuthCard title="Accept invitation" description={`Signed in as ${user.email}.`}>
      <PendingButton
        size="lg"
        className="w-full"
        pending={accept.isPending}
        onClick={() => accept.mutate({ body: { token } })}
      >
        Accept invitation
      </PendingButton>
    </AuthCard>
  )
}

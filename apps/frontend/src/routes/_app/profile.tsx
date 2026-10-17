import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@monorepo/ui/components/card'
import { createFileRoute, getRouteApi, useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { toast } from 'sonner'
import { PendingButton } from '@/components/form-fields'
import { PageHeader } from '@/components/page-header'
import { UserAvatar } from '@/components/user-avatar'
import { api } from '@/lib/api'
import { errorMessage } from '@/lib/errors'

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})

const appRoute = getRouteApi('/_app')

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' })

function ProfilePage() {
  const { user } = appRoute.useLoaderData()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Profile" description="How you appear to the people in your workspaces." />
      <AvatarCard />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Details</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="sm:col-span-2">{user.fullName ?? '—'}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="break-all sm:col-span-2">{user.email}</dd>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="sm:col-span-2">
              {user.createdAt ? dateFormat.format(new Date(user.createdAt)) : '—'}
            </dd>
          </dl>
        </CardContent>
      </Card>
    </main>
  )
}

const AVATAR_TYPES = 'image/png,image/jpeg,image/webp'

function AvatarCard() {
  const { user } = appRoute.useLoaderData()
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<'upload' | 'remove' | null>(null)

  const setAvatar = async (attachmentId: string | null) => {
    const [, error] = await api.profile.avatar.update({ body: { attachmentId } }).safe()

    if (error) {
      toast.error(errorMessage(error))

      return
    }

    await router.invalidate()
    toast.success(attachmentId ? 'Photo updated' : 'Photo removed')
  }

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) return

    setPending('upload')

    try {
      const [attachment, error] = await api.attachments.attachments.store({ body: { file } }).safe()

      if (error) toast.error(errorMessage(error))
      else await setAvatar(attachment.data.id)
    } finally {
      input.value = ''
      setPending(null)
    }
  }

  const remove = async () => {
    setPending('remove')

    try {
      await setAvatar(null)
    } finally {
      setPending(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Photo</h2>
        </CardTitle>
        <CardDescription>A JPG, PNG or WebP image up to 2 MB.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar user={user} alt="Your photo" className="size-16" />
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept={AVATAR_TYPES}
              aria-label="Photo file"
              tabIndex={-1}
              className="sr-only"
              onChange={upload}
            />
            <PendingButton
              variant="outline"
              pending={pending === 'upload'}
              disabled={pending !== null}
              onClick={() => fileInput.current?.click()}
            >
              {user.avatar ? 'Replace photo' : 'Upload photo'}
            </PendingButton>
            {user.avatar && (
              <PendingButton
                variant="ghost"
                pending={pending === 'remove'}
                disabled={pending !== null}
                onClick={remove}
              >
                Remove photo
              </PendingButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

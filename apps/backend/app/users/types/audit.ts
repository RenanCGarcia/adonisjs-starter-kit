import type User from '#users/models/user'
import type { AccountEvent, Changes } from '#core/audit/types'

declare module '#core/audit/types' {
  interface AuditEvents {
    'user.avatar_changed': AccountEvent<'user', { changes: Changes<User, 'avatarAttachmentId'> }>
    'user.profile_updated': AccountEvent<'user', { changes: Changes<User, 'locale' | 'timezone'> }>
  }
}

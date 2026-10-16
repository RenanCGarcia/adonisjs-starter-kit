import type User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { defineAttachmentRule } from '#attachments/rules'
import { ClaimAttachments } from '#attachments/services/claim_attachments'

const avatarRule = defineAttachmentRule({
  extnames: ['jpg', 'jpeg', 'png', 'webp'],
  maxSize: '2mb',
})

export interface UpdateAvatarInput {
  user: User
  attachmentId: string | null
}

export default class UpdateAvatar {
  /** The replaced avatar is left in place: attachments:prune removes it once nothing references it. */
  async handle({ user, attachmentId }: UpdateAvatarInput) {
    return db.transaction(async trx => {
      user.useTransaction(trx)

      if (attachmentId !== null && attachmentId !== user.avatarAttachmentId) {
        await new ClaimAttachments().handle(trx, {
          ids: [attachmentId],
          uploaderId: user.id,
          rule: avatarRule,
        })
      }

      user.avatarAttachmentId = attachmentId
      await user.save()
      await user.load('avatar')

      return user
    })
  }
}

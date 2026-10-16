import vine from '@vinejs/vine'

export const updateAvatarValidator = vine.create({
  attachmentId: vine.string().uuid().nullable(),
})

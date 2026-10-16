import type User from '#users/models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import AttachmentTransformer from '#attachments/transformers/attachment_transformer'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'fullName',
        'email',
        'createdAt',
        'updatedAt',
        'initials',
      ]),
      avatar: AttachmentTransformer.transform(this.whenLoaded(this.resource.avatar)),
    }
  }
}

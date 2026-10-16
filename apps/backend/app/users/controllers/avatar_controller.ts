import type { HttpContext } from '@adonisjs/core/http'
import UpdateAvatar from '#users/actions/update_avatar'
import { updateAvatarValidator } from '#users/validators/user'
import UserTransformer from '#users/transformers/user_transformer'

export default class AvatarController {
  async update({ request, auth, serialize }: HttpContext) {
    const { attachmentId } = await request.validateUsing(updateAvatarValidator)

    const user = await new UpdateAvatar().handle({ user: auth.getUserOrFail(), attachmentId })

    return serialize(UserTransformer.transform(user))
  }
}

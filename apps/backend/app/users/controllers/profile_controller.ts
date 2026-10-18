import UserTransformer from '#users/transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import UpdateProfile from '#users/actions/update_profile'
import { updateProfileValidator } from '#users/validators/user'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load(preloader => preloader.load('avatar'))

    return serialize(UserTransformer.transform(user))
  }

  async update({ auth, request, serialize }: HttpContext) {
    const { locale, timezone } = await request.validateUsing(updateProfileValidator)

    const user = await new UpdateProfile().handle({ user: auth.getUserOrFail(), locale, timezone })
    await user.load(preloader => preloader.load('avatar'))

    return serialize(UserTransformer.transform(user))
  }
}

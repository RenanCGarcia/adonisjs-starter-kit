import UserTransformer from '#users/transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load(preloader => preloader.load('avatar'))

    return serialize(UserTransformer.transform(user))
  }
}

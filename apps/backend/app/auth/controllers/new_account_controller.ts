import SignUp from '#auth/actions/sign_up'
import { signupValidator } from '#auth/validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#users/transformers/user_transformer'

export default class NewAccountController {
  async store({ i18n, request, serialize }: HttpContext) {
    const { locale, timezone, ...account } = await request.validateUsing(signupValidator)

    const { user, token } = await new SignUp().handle({
      ...account,
      locale: locale ?? i18n.locale,
      timezone: timezone ?? null,
      userAgent: request.header('user-agent'),
      ipAddress: request.ip(),
    })

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}

import User from '#users/models/user'
import LogIn from '#auth/actions/log_in'
import { audit } from '#core/audit/main'
import type {} from '#auth/types/audit'
import { loginValidator } from '#auth/validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#users/transformers/user_transformer'

export default class AccessTokensController {
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const result = await new LogIn().handle({
      email,
      password,
      userAgent: request.header('user-agent'),
      ipAddress: request.ip(),
    })

    if (result.twoFactorRequired) return serialize(result)

    return serialize({
      twoFactorRequired: false as const,
      user: UserTransformer.transform(result.user),
      token: result.token.value!.release(),
    })
  }

  async destroy({ auth, i18n, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    await audit.note('auth.logged_out', {
      tenantId: null,
      subject: { type: 'user', id: user.id },
      data: { email: user.email },
    })

    return serialize({
      message: i18n.t('auth.logged_out'),
    })
  }
}

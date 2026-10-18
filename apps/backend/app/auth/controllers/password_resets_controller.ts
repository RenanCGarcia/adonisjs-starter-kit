import type { HttpContext } from '@adonisjs/core/http'
import ResetPassword from '#auth/actions/reset_password'
import RevokeSessions from '#auth/actions/revoke_sessions'
import RequestPasswordReset from '#auth/actions/request_password_reset'
import { forgotPasswordValidator, resetPasswordValidator } from '#auth/validators/auth'

export default class PasswordResetsController {
  async store({ i18n, request, serialize }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    await new RequestPasswordReset().handle({ email, locale: i18n.locale })

    return serialize({ message: i18n.t('auth.password_reset_requested') })
  }

  async update({ i18n, request, serialize }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const user = await new ResetPassword().handle({ token, password })

    // Whoever knew the old password is signed out everywhere, including the one resetting it.
    await new RevokeSessions().handle({ user })

    return serialize({ message: i18n.t('auth.password_reset') })
  }
}

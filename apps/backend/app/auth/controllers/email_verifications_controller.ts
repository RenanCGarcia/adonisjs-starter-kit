import type { HttpContext } from '@adonisjs/core/http'
import VerifyEmail from '#auth/actions/verify_email'
import { verifyEmailValidator } from '#auth/validators/auth'
import ResendEmailVerification from '#auth/actions/resend_email_verification'

export default class EmailVerificationsController {
  async store({ auth, i18n, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    await new ResendEmailVerification().handle({ user, locale: i18n.locale })

    return serialize({ message: i18n.t('auth.email_verification_requested') })
  }

  async update({ i18n, request, serialize }: HttpContext) {
    const { token } = await request.validateUsing(verifyEmailValidator)

    await new VerifyEmail().handle({ token })

    return serialize({ message: i18n.t('auth.email_verified') })
  }
}

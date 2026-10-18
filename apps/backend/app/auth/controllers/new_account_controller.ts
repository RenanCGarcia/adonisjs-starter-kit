import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import OpenSession from '#auth/actions/open_session'
import type {} from '#auth/types/audit'
import type {} from '#auth/types/events'
import emitter from '@adonisjs/core/services/emitter'
import { issueUserToken } from '#auth/services/user_tokens'
import { signupValidator } from '#auth/validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#users/transformers/user_transformer'
import { mailLocaleFor } from '#users/services/mail_locale'

export default class NewAccountController {
  async store({ i18n, request, serialize }: HttpContext) {
    const { fullName, email, password, locale, timezone } =
      await request.validateUsing(signupValidator)

    const { user, verificationToken } = await db.transaction(async trx => {
      const created = await User.create(
        { fullName, email, password, locale: locale ?? i18n.locale, timezone: timezone ?? null },
        { client: trx },
      )

      await audit.record(trx, 'auth.signed_up', {
        tenantId: null,
        subject: { type: 'user', id: created.id },
        actorId: created.id,
        data: { email, fullName },
      })

      return {
        user: created,
        verificationToken: await issueUserToken(trx, created.id, 'email_verification'),
      }
    })

    await emitter.emit('auth:email_verification_requested', {
      email,
      token: verificationToken,
      locale: mailLocaleFor(user, i18n.locale),
    })

    const token = await new OpenSession().handle({
      user,
      userAgent: request.header('user-agent'),
      ipAddress: request.ip(),
    })

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}

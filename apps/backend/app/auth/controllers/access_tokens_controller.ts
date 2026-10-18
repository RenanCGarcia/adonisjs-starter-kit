import User from '#users/models/user'
import { audit } from '#core/audit/main'
import OpenSession from '#auth/actions/open_session'
import type {} from '#auth/types/audit'
import { loginValidator } from '#auth/validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as limiterErrors } from '@adonisjs/limiter'
import UserTransformer from '#users/transformers/user_transformer'
import { penalizeLoginFailure } from '#start/limiter'
import AccountDisabledException from '#auth/exceptions/account_disabled_exception'
import { issueTwoFactorChallenge } from '#auth/services/two_factor'

/** The password was right, but the account needs a second factor before a session opens. */
async function challenge(user: User) {
  await audit.note('auth.two_factor_challenged', {
    tenantId: null,
    subject: { type: 'user', id: user.id },
    actorId: user.id,
    data: { email: user.email },
  })

  return { twoFactorRequired: true as const, challenge: issueTwoFactorChallenge(user.id) }
}

export default class AccessTokensController {
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    let user: User

    try {
      user = await penalizeLoginFailure(email, request.ip(), () => {
        return User.verifyCredentials(email, password)
      })
    } catch (error) {
      // A throttle rejection isn't a credential attempt: nothing to audit, just rethrow for the
      // exception handler to turn into a 429.
      if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) throw error

      const owner = await User.findBy('email', email)

      await audit.note('auth.login_failed', {
        tenantId: null,
        subject: owner ? { type: 'user', id: owner.id } : null,
        data: { email },
      })

      throw error
    }

    // After the password check, so the answer doesn't tell whether an email is disabled.
    if (user.disabledAt) throw new AccountDisabledException()

    if (user.twoFactorConfirmedAt) return serialize(await challenge(user))

    const token = await new OpenSession().handle({
      user,
      userAgent: request.header('user-agent'),
      ipAddress: request.ip(),
    })

    // Enabling 2FA revokes every other session once it commits: a token created before that is
    // revoked, and one created after sees the confirmation here.
    if (user.twoFactorConfirmedAt) {
      await User.accessTokens.delete(user, token.identifier)

      return serialize(await challenge(user))
    }

    await audit.note('auth.logged_in', {
      tenantId: null,
      subject: { type: 'user', id: user.id },
      actorId: user.id,
      sessionId: String(token.identifier),
      data: { email: user.email },
    })

    return serialize({
      twoFactorRequired: false as const,
      user: UserTransformer.transform(user),
      token: token.value!.release(),
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

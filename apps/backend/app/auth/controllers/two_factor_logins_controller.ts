import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#auth/types/audit'
import OpenSession from '#auth/actions/open_session'
import type { HttpContext } from '@adonisjs/core/http'
import { penalizeTwoFactorFailure } from '#start/limiter'
import UserTransformer from '#users/transformers/user_transformer'
import { twoFactorLoginValidator } from '#auth/validators/two_factor'
import AccountDisabledException from '#auth/exceptions/account_disabled_exception'
import InvalidTwoFactorCodeException from '#auth/exceptions/invalid_two_factor_code_exception'
import InvalidTwoFactorChallengeException from '#auth/exceptions/invalid_two_factor_challenge_exception'
import {
  countRecoveryCodes,
  readTwoFactorChallenge,
  secondFactorOf,
  verifySecondFactor,
} from '#auth/services/two_factor'

export default class TwoFactorLoginsController {
  /** The second step of a login that answered a challenge: the challenge and a second factor. */
  async store({ request, serialize }: HttpContext) {
    const input = await request.validateUsing(twoFactorLoginValidator)

    const userId = readTwoFactorChallenge(input.challenge)
    const user = userId ? await User.find(userId) : null

    // Also when two-factor was disabled since the challenge: the password alone signs in again.
    if (!user?.twoFactorConfirmedAt) throw new InvalidTwoFactorChallengeException()

    if (user.disabledAt) throw new AccountDisabledException()

    const factor = secondFactorOf(input)

    try {
      await penalizeTwoFactorFailure(user.id, async () => {
        if (!(await verifySecondFactor(db.connection(), user, factor))) {
          throw new InvalidTwoFactorCodeException()
        }
      })
    } catch (error) {
      if (error instanceof InvalidTwoFactorCodeException) {
        await audit.note('auth.two_factor_failed', {
          tenantId: null,
          subject: { type: 'user', id: user.id },
          data: { email: user.email },
        })
      }

      throw error
    }

    const token = await new OpenSession().handle({
      user,
      userAgent: request.header('user-agent'),
      ipAddress: request.ip(),
    })

    if (factor.type === 'recovery_code') {
      await audit.note('auth.recovery_code_used', {
        tenantId: null,
        subject: { type: 'user', id: user.id },
        actorId: user.id,
        sessionId: String(token.identifier),
        data: { email: user.email, remaining: await countRecoveryCodes(db.connection(), user.id) },
      })
    }

    await audit.note('auth.logged_in', {
      tenantId: null,
      subject: { type: 'user', id: user.id },
      actorId: user.id,
      sessionId: String(token.identifier),
      data: { email: user.email, factor: factor.type },
    })

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}

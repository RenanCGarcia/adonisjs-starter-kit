import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import type {} from '#auth/types/audit'
import ListSessions from '#auth/queries/list_sessions'
import type { HttpContext } from '@adonisjs/core/http'
import RevokeSessions from '#auth/actions/revoke_sessions'
import ImpersonatingException from '#auth/exceptions/impersonating_exception'
import SessionTransformer from '#auth/transformers/session_transformer'
import { sessionParamsValidator } from '#auth/validators/session'
import SessionNotFoundException from '#auth/exceptions/session_not_found_exception'

export default class SessionsController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const currentTokenId = String(user.currentAccessToken!.identifier)

    const rows = await new ListSessions().handle({ userId: user.id, currentTokenId })

    return serialize(SessionTransformer.transform(rows))
  }

  async destroy({ auth, i18n, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.currentAccessToken?.impersonatorId) throw new ImpersonatingException()

    const { params } = await request.validateUsing(sessionParamsValidator)

    const row = await db
      .from('auth_access_tokens')
      .where('id', params.id)
      .where('tokenable_id', user.id)
      .whereNull('impersonator_id')
      .first()

    if (!row) throw new SessionNotFoundException()

    await User.accessTokens.delete(user, params.id)

    await audit.note('auth.session_revoked', {
      tenantId: null,
      subject: { type: 'user', id: user.id },
      sessionId: params.id,
      data: { email: user.email },
    })

    return serialize({ message: i18n.t('auth.session_revoked') })
  }

  async destroyAll({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.currentAccessToken?.impersonatorId) throw new ImpersonatingException()

    const keepTokenId = String(user.currentAccessToken!.identifier)
    const revoked = await new RevokeSessions().handle({ user, keepTokenId })

    return serialize({ revoked })
  }
}

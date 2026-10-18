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

    const revoked = await new RevokeSessions().handle({ user, sessionId: params.id })

    if (!revoked) throw new SessionNotFoundException()

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

import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'
import { audit } from '#core/audit/main'
import OpenSession from '#auth/actions/open_session'
import type {} from '#auth/types/audit'
import { signupValidator } from '#auth/validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#users/transformers/user_transformer'

export default class NewAccountController {
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const user = await db.transaction(async trx => {
      const created = await User.create({ fullName, email, password }, { client: trx })

      await audit.record(trx, 'auth.signed_up', {
        tenantId: null,
        subject: { type: 'user', id: created.id },
        actorId: created.id,
        data: { email, fullName },
      })

      return created
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

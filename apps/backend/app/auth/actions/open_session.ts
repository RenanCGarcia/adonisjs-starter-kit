import User from '#users/models/user'
import db from '@adonisjs/lucid/services/db'

export interface OpenSessionInput {
  user: User
  userAgent: string | undefined
  ipAddress: string
}

/** Issues an access token for a real sign-in, recording the device it was issued to. */
export default class OpenSession {
  async handle({ user, userAgent, ipAddress }: OpenSessionInput) {
    const token = await User.accessTokens.create(user)

    // The provider's insert takes no extra columns, so the device info follows as its own write.
    await db
      .from('auth_access_tokens')
      .where('id', String(token.identifier))
      .update({ user_agent: userAgent?.slice(0, 512) ?? null, ip_address: ipAddress })

    return token
  }
}

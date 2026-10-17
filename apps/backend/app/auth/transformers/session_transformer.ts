import type { SessionRow } from '#auth/queries/list_sessions'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SessionTransformer extends BaseTransformer<SessionRow> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'userAgent',
      'ipAddress',
      'createdAt',
      'lastUsedAt',
      'current',
    ])
  }
}

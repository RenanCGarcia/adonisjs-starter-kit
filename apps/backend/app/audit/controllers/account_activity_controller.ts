import type { HttpContext } from '@adonisjs/core/http'
import ListAuditEvents from '#audit/queries/list_audit_events'
import { listAccountActivityValidator } from '#audit/validators/audit_event'
import AuditEventTransformer from '#audit/transformers/audit_event_transformer'

export default class AccountActivityController {
  async index({ auth, request, serialize }: HttpContext) {
    const pages = await request.validateUsing(listAccountActivityValidator)

    const { rows, meta } = await new ListAuditEvents().handle({
      trail: { accountOf: auth.getUserOrFail().id },
      ...pages,
    })

    return serialize(AuditEventTransformer.paginate(rows, meta).useVariant('forAccount'))
  }
}

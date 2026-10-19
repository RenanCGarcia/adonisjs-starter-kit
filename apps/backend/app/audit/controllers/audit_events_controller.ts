import { can } from '#access/abilities'
import { PERMISSIONS } from '#access/permissions'
import type { HttpContext } from '@adonisjs/core/http'
import ListAuditEvents from '#audit/queries/list_audit_events'
import { SUBJECT_PERMISSIONS } from '#audit/subject_permissions'
import { listAuditEventsValidator } from '#audit/validators/audit_event'
import AuditEventTransformer from '#audit/transformers/audit_event_transformer'

/**
 * @tags Audit
 */
export default class AuditEventsController {
  /**
   * List the tenant's audit events
   *
   * Newest first. The whole trail requires `audit.view`. Filtering by `subjectType` also lets in
   * the permission of the feature that owns that subject: `roles.manage` for `role`, and
   * `members.manage` for `member` and `invitation`. `type` keeps only the listed event types, and
   * `from` and `to` bound the creation date, both inclusive.
   *
   * @throws {400} The X-Tenant-Id header is missing or not a UUID
   * @throws {403} Not a member of the tenant, the tenant is suspended, or lacks `audit.view`
   */
  async index({ bouncer, request, tenant, serialize }: HttpContext) {
    const { type, ...filters } = await request.validateUsing(listAuditEventsValidator)

    const subjectPermission = filters.subjectType && SUBJECT_PERMISSIONS.get(filters.subjectType)

    const allowed =
      (await bouncer.allows(can, PERMISSIONS.auditView)) ||
      (!!subjectPermission && (await bouncer.allows(can, subjectPermission)))

    if (!allowed) await bouncer.authorize(can, PERMISSIONS.auditView)

    const { rows, meta } = await new ListAuditEvents().handle({
      trail: { tenantId: tenant.id },
      types: type,
      ...filters,
    })

    return serialize(AuditEventTransformer.paginate(rows, meta))
  }
}

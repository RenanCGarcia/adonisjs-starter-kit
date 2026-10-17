import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Invitation from '#access/models/invitation'
import RoleAssignment from '#access/models/role_assignment'
import TenantMembership from '#tenancy/models/tenant_membership'
import { runAsSystem, runInTenant } from '#tenancy/tenant_context'
import InvitationNotFoundException from '#access/exceptions/invitation_not_found_exception'
import InvitationEmailMismatchException from '#access/exceptions/invitation_email_mismatch_exception'

export interface AcceptInvitationInput {
  token: string
  userId: string
  userEmail: string
}

export default class AcceptInvitation {
  /** Returns the id of the tenant the invitation grants access to. */
  async handle({ token, userId, userEmail }: AcceptInvitationInput): Promise<string> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const invitation = await runAsSystem(() =>
      Invitation.query().where('token_hash', tokenHash).first(),
    )

    if (!invitation || invitation.expiresAt < DateTime.now()) {
      throw new InvitationNotFoundException()
    }

    if (invitation.email !== userEmail.toLowerCase()) throw new InvitationEmailMismatchException()

    const { tenantId, roleId } = invitation

    await runInTenant(tenantId, () =>
      db.transaction(async trx => {
        const membership = await TenantMembership.query({ client: trx })
          .where('tenant_id', tenantId)
          .where('user_id', userId)
          .first()

        // Already a member: the invitation is spent and nothing else changes. Makes a retry
        // after a crash between the membership write and this delete safe to repeat.
        if (!membership) {
          await TenantMembership.create({ tenantId, userId }, { client: trx })

          if (roleId) await RoleAssignment.create({ tenantId, userId, roleId }, { client: trx })
        }

        await invitation.useTransaction(trx).delete()
      }),
    )

    return tenantId
  }
}

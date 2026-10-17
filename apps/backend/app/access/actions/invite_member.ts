import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import emitter from '@adonisjs/core/services/emitter'
import Invitation from '#access/models/invitation'
import type { MemberInvited } from '#access/types/events'
import AlreadyMemberException from '#access/exceptions/already_member_exception'

export interface InviteMemberInput {
  tenantId: string
  email: string
  roleId: string | null
  invitedById: string
  locale: string
}

export const EXPIRY = { days: 7 }

export default class InviteMember {
  /**
   * Upserts on (tenantId, email): re-inviting refreshes the token, role, inviter and expiry
   * instead of failing. Emits after commit, so the mail always points at a stored invitation.
   */
  async handle({ tenantId, email, roleId, invitedById, locale }: InviteMemberInput) {
    const alreadyMember = await db
      .from('tenant_memberships')
      .join('users', 'users.id', 'tenant_memberships.user_id')
      .where('tenant_memberships.tenant_id', tenantId)
      .where('users.email', email)
      .first()

    if (alreadyMember) throw new AlreadyMemberException()

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const invitation = await db.transaction(trx =>
      Invitation.updateOrCreate(
        { tenantId, email },
        { roleId, tokenHash, invitedById, expiresAt: DateTime.now().plus(EXPIRY) },
        { client: trx },
      ),
    )

    await emitter.emit('access:member_invited', {
      tenantId,
      email,
      token,
      locale,
    } satisfies MemberInvited)

    return invitation
  }
}

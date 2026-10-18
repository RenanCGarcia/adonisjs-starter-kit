import { LinkMail } from '#core/mails/link_mail'
import { EXPIRY } from '#access/actions/invite_member'

export default class InvitationMail extends LinkMail {
  protected prefix = 'access.invitation_mail'
  protected view = 'invitation'
  protected expiresIn = { days: EXPIRY.days }
}

import { Exception } from '@adonisjs/core/exceptions'

export default class InvitationEmailMismatchException extends Exception {
  static override status = 403
  static override code = 'E_INVITATION_EMAIL_MISMATCH'
  static override message = 'This invitation was sent to a different email'
}

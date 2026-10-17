import { Exception } from '@adonisjs/core/exceptions'

export default class InvitationNotFoundException extends Exception {
  static override status = 404
  static override code = 'E_INVITATION_NOT_FOUND'
  static override message = 'This invitation is unknown or has expired'
}

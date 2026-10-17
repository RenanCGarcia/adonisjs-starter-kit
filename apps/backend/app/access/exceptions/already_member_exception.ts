import { Exception } from '@adonisjs/core/exceptions'

export default class AlreadyMemberException extends Exception {
  static override status = 409
  static override code = 'E_ALREADY_MEMBER'
  static override message = 'This email already belongs to a member of this tenant'
}

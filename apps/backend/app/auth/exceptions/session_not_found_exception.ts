import { Exception } from '@adonisjs/core/exceptions'

export default class SessionNotFoundException extends Exception {
  static override status = 404
  static override code = 'E_SESSION_NOT_FOUND'
  static override message = 'This session does not exist'
}

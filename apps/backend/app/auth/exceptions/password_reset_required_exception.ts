import { Exception } from '@adonisjs/core/exceptions'

export default class PasswordResetRequiredException extends Exception {
  static override status = 403
  static override code = 'E_PASSWORD_RESET_REQUIRED'
  static override message = 'Choose a new password through the emailed link before signing in'
}

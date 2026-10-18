import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidVerificationTokenException extends Exception {
  static override status = 400
  static override code = 'E_INVALID_VERIFICATION_TOKEN'
  static override message = 'This email verification link is unknown or has expired'
}

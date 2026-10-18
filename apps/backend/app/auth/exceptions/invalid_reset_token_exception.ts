import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidResetTokenException extends Exception {
  static override status = 400
  static override code = 'E_INVALID_RESET_TOKEN'
  static override message = 'This password reset link is unknown or has expired'
}

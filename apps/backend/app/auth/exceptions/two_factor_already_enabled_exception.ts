import { Exception } from '@adonisjs/core/exceptions'

export default class TwoFactorAlreadyEnabledException extends Exception {
  static override status = 409
  static override code = 'E_TWO_FACTOR_ALREADY_ENABLED'
  static override message = 'Two-factor authentication is already enabled'
}

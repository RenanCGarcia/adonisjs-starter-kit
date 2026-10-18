import { Exception } from '@adonisjs/core/exceptions'

export default class TwoFactorNotEnabledException extends Exception {
  static override status = 409
  static override code = 'E_TWO_FACTOR_NOT_ENABLED'
  static override message = 'Two-factor authentication is not enabled'
}

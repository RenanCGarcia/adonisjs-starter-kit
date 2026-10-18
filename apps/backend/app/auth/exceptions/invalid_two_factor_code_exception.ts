import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidTwoFactorCodeException extends Exception {
  static override status = 400
  static override code = 'E_INVALID_TWO_FACTOR_CODE'
  static override message = 'The two-factor code is wrong or was already used'
}

import { Exception } from '@adonisjs/core/exceptions'

export default class TwoFactorNotStartedException extends Exception {
  static override status = 409
  static override code = 'E_TWO_FACTOR_NOT_STARTED'
  static override message = 'Two-factor enrollment has not been started'
}

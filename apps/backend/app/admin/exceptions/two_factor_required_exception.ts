import { Exception } from '@adonisjs/core/exceptions'

export default class TwoFactorRequiredException extends Exception {
  static override status = 403
  static override code = 'E_TWO_FACTOR_REQUIRED'
  static override message = 'Platform admins must enable two-factor authentication first'
}

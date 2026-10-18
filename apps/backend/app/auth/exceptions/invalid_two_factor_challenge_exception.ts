import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidTwoFactorChallengeException extends Exception {
  static override status = 400
  static override code = 'E_INVALID_TWO_FACTOR_CHALLENGE'
  static override message = 'The two-factor challenge is invalid or has expired'
}

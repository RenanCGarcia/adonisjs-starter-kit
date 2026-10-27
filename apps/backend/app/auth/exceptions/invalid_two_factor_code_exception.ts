import ApiException from '#core/exceptions/api_exception'

export default class InvalidTwoFactorCodeException extends ApiException<'E_INVALID_TWO_FACTOR_CODE'> {
  static override status = 400
  static override code = 'E_INVALID_TWO_FACTOR_CODE'
  static override message = 'The two-factor code is wrong or was already used'
}

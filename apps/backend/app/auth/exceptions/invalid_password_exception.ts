import { Exception } from '@adonisjs/core/exceptions'

export default class InvalidPasswordException extends Exception {
  static override status = 400
  static override code = 'E_INVALID_PASSWORD'
  static override message = 'The password is wrong'
}

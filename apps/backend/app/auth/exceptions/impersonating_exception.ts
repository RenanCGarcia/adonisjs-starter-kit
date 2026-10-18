import { Exception } from '@adonisjs/core/exceptions'

export default class ImpersonatingException extends Exception {
  static override status = 403
  static override code = 'E_IMPERSONATING'
  static override message =
    'An impersonated session cannot change the user’s sessions or security settings'
}

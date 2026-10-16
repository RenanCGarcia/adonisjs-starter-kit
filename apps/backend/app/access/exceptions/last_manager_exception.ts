import { Exception } from '@adonisjs/core/exceptions'

export default class LastManagerException extends Exception {
  static override status = 409
  static override code = 'E_LAST_MANAGER'
  static override message = 'This change would leave no one able to manage members'
}

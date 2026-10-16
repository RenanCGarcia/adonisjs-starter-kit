import { Exception } from '@adonisjs/core/exceptions'

export default class RoleInUseException extends Exception {
  static override status = 409
  static override code = 'E_ROLE_IN_USE'
  static override message = 'Assign another role to its members before deleting this role'
}
